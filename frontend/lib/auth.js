import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

async function ensureUserProfile(user) {
  const admin = getAdminClient();
  const metadata = user.user_metadata || {};
  const payload = {
    id: user.id,
    email: user.email,
    full_name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "Vehicle Owner",
    phone: metadata.phone || "",
    role: metadata.role === "admin" ? "admin" : "user"
  };

  await admin.from("users").upsert(payload, { onConflict: "id" });
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  await ensureUserProfile(user);

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  return { user, profile };
}

export async function requireUser() {
  const session = await getCurrentSession();
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  return session;
}
