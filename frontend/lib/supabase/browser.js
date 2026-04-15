"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error(
      "CRITICAL: Supabase environment variables are missing. " +
      "Check your .env.local or Vercel environment settings."
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}
