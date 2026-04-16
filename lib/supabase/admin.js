import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let adminClient;

export function getAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Profile syncing will be disabled.");
    return null;
  }

  if (!adminClient) {
    adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return adminClient;
}
