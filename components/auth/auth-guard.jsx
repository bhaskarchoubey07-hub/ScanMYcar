"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check localStorage on the client side
    const savedUser = localStorage.getItem("user");
    
    if (!savedUser) {
      router.push("/auth");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Prevent "flash" of protected content while checking session
  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
