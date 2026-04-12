"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();

  const sendOtp = () => {
    startTransition(async () => {
      setStatus("");

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            phone
          }
        }
      });

      setStatus(error ? error.message : "OTP sent. Check your email for the code or secure sign-in link.");
    });
  };

  const verifyOtp = () => {
    startTransition(async () => {
      setStatus("");

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email"
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-neon">
          Email OTP Authentication
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Smart Vehicle Identity with rapid emergency outreach built in.
        </h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Register vehicles, generate dynamic QR codes, trigger SOS alerts, and monitor every scan from a single
          mobile-first dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Dynamic QR", "Unique public profile for every vehicle"],
            ["Emergency SOS", "Location-aware scan and alert flows"],
            ["Admin Insights", "Live totals, activity, and exports"]
          ].map(([title, copy]) => (
            <div key={title} className="glass-panel rounded-3xl p-5">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-slate-400">{copy}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-7 shadow-glass">
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "signin" ? "bg-neon text-slate-950" : "text-slate-300"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "signup" ? "bg-glow text-slate-950" : "text-slate-300"}`}
          >
            Create account
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <>
              <label className="field">
                <span>Full name</span>
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Aarav Sharma" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 9876543210" />
              </label>
            </>
          )}

          <label className="field">
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@example.com" />
          </label>

          <button type="button" onClick={sendOtp} disabled={pending || !email} className="primary-button w-full">
            {pending ? "Sending..." : "Send OTP"}
          </button>

          <label className="field">
            <span>Enter OTP</span>
            <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" />
          </label>

          <button type="button" onClick={verifyOtp} disabled={pending || otp.length < 6} className="secondary-button w-full">
            {pending ? "Verifying..." : "Verify & continue"}
          </button>
          {status && <p className="text-sm text-slate-300">{status}</p>}
        </div>
      </div>
    </div>
  );
}
