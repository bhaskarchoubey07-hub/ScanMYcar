"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { createClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="secondary-button w-full"
      onClick={() =>
        startTransition(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          Cookies.remove("auth-token");
          router.push("/auth");
          router.refresh();
        })
      }
    >
      {pending ? "Signing out..." : "Logout"}
    </button>
  );
}
