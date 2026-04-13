"use client";

import { motion } from "framer-motion";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      setStatus("");

      if (!password || !confirmPassword) {
        setStatus("Both fields are required.");
        return;
      }

      if (password.length < 6) {
        setStatus("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setStatus("Passwords do not match.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setSuccess(true);
      
      // Auto-redirect after visual confirmation
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 pb-20 sm:p-10">
      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.1),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-panel floating-glow rounded-[2rem] p-8 shadow-glass text-center">
          
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20 text-emerald-400">
            {success ? <ShieldCheck className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            {success ? "Vault Secured" : "Update Password"}
          </h1>
          
          <p className="text-sm text-slate-400 mb-8">
            {success 
              ? "Your new security token has been accepted."
              : "Enter a strong new password to lock down your fleet operations."}
          </p>

          {!success ? (
            <div className="space-y-4 text-left">
              <label className="field">
                <span>New Password</span>
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(52, 211, 153, 0.16)" }}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </label>

              <label className="field">
                <span>Confirm Password</span>
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(52, 211, 153, 0.16)" }}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </label>

              <button
                type="button"
                disabled={pending}
                onClick={handleUpdate}
                className="w-full primary-button bg-emerald-500 text-slate-950 font-semibold mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {pending ? "Updating Protocol..." : "Confirm New Password"}
              </button>

              {status && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-red-400 mt-4"
                >
                  {status}
                </motion.p>
              )}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center items-center text-sm font-semibold text-emerald-400 gap-2"
            >
              Transferring to Dashboard <ArrowRight className="h-4 w-4 animate-pulse" />
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
