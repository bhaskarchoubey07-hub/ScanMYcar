"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const errorMsg = `[@supabase/ssr] Missing credentials: URL=${!!url}, KEY=${!!key}. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.`;
    console.error(errorMsg);
    // On the client, we want to see this in the browser console immediately
    if (typeof window !== "undefined") {
      window.SUPABASE_CONFIG_ERROR = errorMsg;
    }
  }

  if (!browserClient) {
    if (!url || !key) {
      throw new Error("Supabase URL and Anon Key are required for client initialization.");
    }
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}
