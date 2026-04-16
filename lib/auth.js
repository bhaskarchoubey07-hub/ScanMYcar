import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Fetch Secure Supabase Session (Server Side)
 */
export async function getCurrentSession() {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    // Fetch profile from public.users (Managed by DB triggers)
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // Sanitize user object for serialization
    const safeUser = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {}
    };

    return { user: safeUser, profile: profile || safeUser };
  } catch (err) {
    console.error("Session Retrieval Failure:", err);
    return { user: null, profile: null };
  }
}

/**
 * Route Guard: Require Authenticated User
 */
export async function requireUser() {
  const session = await getCurrentSession();
  if (!session.user) {
    redirect("/auth");
  }
  return session;
}

/**
 * Route Guard: Require Administrative Privileges
 */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Helper to get access token for client-side use (if needed)
 */
export async function getBackendAccessToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
