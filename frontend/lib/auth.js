import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { jwtDecode } from "jwt-decode";

async function ensureUserProfile(user) {
  const admin = getAdminClient();
  if (!admin) return;

  const metadata = user.user_metadata || {};
  
  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.name || metadata.full_name || metadata.name || user.email?.split("@")[0] || "Vehicle Owner",
    phone: user.phone || metadata.phone || "",
    role: user.role || (metadata.role === "admin" ? "admin" : "user"),
    metadata: metadata
  };

  const { error } = await admin.from("users").upsert(payload, { onConflict: "id" });
  if (error) console.error("Profile sync failed:", error.message);
}

export async function getCurrentSession() {
  const cookieStore = cookies();
  const authToken = cookieStore.get("auth-token")?.value;

  // 1. Check for custom backend session (Fintech-grade)
  if (authToken) {
    try {
      const decoded = jwtDecode(authToken);
      
      // Basic check for expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Custom auth token expired");
      } else {
        const user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        };

        // Fetch profile from persistent DB
        const supabase = await createClient();
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();

        return { user, profile: profile || user };
      }
    } catch (err) {
      console.error("Error decoding custom token:", err);
    }
  }

  // 2. Fallback to Supabase Auth
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  // Ensure profile exists in our custom users table for features
  await ensureUserProfile(user);

  try {
    const { data: profileResult, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single();
    
    if (profileError) {
      console.error("Profile fetch error in session:", profileError);
    }
    
    const profile = profileResult || null;

    // Strictly sanitize the user object for Server Component serialization
    const safeUser = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {}
    };

    return JSON.parse(JSON.stringify({ user: safeUser, profile }));
  } catch (err) {
    console.error("Exception in getCurrentSession:", err);
    return { user: null, profile: null };
  }
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session.user) {
    redirect("/auth");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}
