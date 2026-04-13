"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  delayedRise,
  fieldReveal,
  pageReveal,
  panelReveal,
  pulseGlow,
  riseIn,
  staggerContainer
} from "@/lib/motion";

const featureItems = [
  ["Dynamic QR", "Unique public profile for every vehicle"],
  ["Emergency SOS", "Location-aware scan and alert flows"],
  ["Admin Insights", "Live totals, activity, and exports"]
];

const glowTransition = {
  type: "spring",
  stiffness: 260,
  damping: 18
};

function formatAuthMessage(message) {
  const normalized = String(message || "").toLowerCase();

  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "User already exists.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Invalid credentials.";
  }

  if (normalized.includes("password")) {
    return "Password must be at least 6 characters.";
  }

  return message || "Something went wrong. Please try again.";
}

export function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [status, setStatus] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [pending, startTransition] = useTransition();

  // Auto-redirect if session exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }, [supabase, router]);

  const completeAuth = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const signIn = () => {
    startTransition(async () => {
      setActiveAction("signin");
      setStatus("");

      try {
        if (!email || !password) {
          setStatus("Email and password are required.");
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setStatus(formatAuthMessage(error.message));
          return;
        }

        completeAuth();
      } finally {
        setActiveAction("");
      }
    });
  };

  const triggerOtp = async (phoneNumber) => {
    // Uses updateUser to trigger SMS for identity verification rather than passwordless clone login
    const { error } = await supabase.auth.updateUser({
      phone: phoneNumber
    });
    if (error) {
      throw error;
    }
  };

  const triggerPasswordReset = () => {
    startTransition(async () => {
      setActiveAction("reset-password");
      setStatus("");

      try {
        if (!email) {
          setStatus("Please enter your email to reset your password.");
          return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`
        });

        if (error) {
          setStatus(formatAuthMessage(error.message));
          return;
        }

        setStatus("Password reset link sent! Please check your email.");
      } finally {
        setActiveAction("");
      }
    });
  };

  const createAccount = () => {
    startTransition(async () => {
      setActiveAction("create-account");
      setStatus("");

      try {
        if (!email || !password || !phone) {
          setStatus("Email, password, and mobile number are required.");
          return;
        }

        if (password.length < 6) {
          setStatus("Password must be at least 6 characters.");
          return;
        }

        // 1. Create the account (Email/Password)
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone
            }
          }
        });

        if (signUpError) {
          setStatus(formatAuthMessage(signUpError.message));
          return;
        }

        // 2. Trigger Phone OTP
        try {
          await triggerOtp(phone);
          setShowOtpStep(true);
          setStatus("Verification code sent to your mobile.");
        } catch (otpError) {
          console.error("OTP send failed:", otpError);
          // If OTP fails but user is created, we might need a retry button
          setStatus("Account created! But we couldn't send the SMS. Please try signing in.");
        }
      } finally {
        setActiveAction("");
      }
    });
  };

  const verifyOtp = () => {
    startTransition(async () => {
      setActiveAction("verify-otp");
      setStatus("");

      try {
        if (!otp || otp.length < 6) {
          setStatus("Please enter the 6-digit code.");
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: "phone_change"
        });

        if (error) {
          setStatus("Invalid verification code. Please try again.");
          return;
        }

        setStatus("Identity verified. Accessing vault...");
        completeAuth();
      } finally {
        setActiveAction("");
      }
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.span
          variants={delayedRise(0.04)}
          className="inline-flex rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-neon"
        >
          Secure User Portal
        </motion.span>
        <motion.h1 variants={delayedRise(0.12)} className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Smart Vehicle Identity with rapid emergency outreach built in.
        </motion.h1>
        <motion.p variants={delayedRise(0.2)} className="max-w-2xl text-base text-slate-300 sm:text-lg">
          Register vehicles, generate dynamic QR codes, trigger SOS alerts, and monitor every scan from a single
          mobile-first dashboard.
        </motion.p>
        <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-3">
          {featureItems.map(([title, copy]) => (
            <motion.div
              key={title}
              variants={riseIn}
              whileHover={{
                scale: 1.05,
                y: -6,
                boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.18), 0 22px 60px rgba(52, 211, 153, 0.2)"
              }}
              transition={glowTransition}
              className="glass-panel hover-neon rounded-3xl p-5"
            >
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-slate-400">{copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        variants={panelReveal}
        initial="hidden"
        animate="visible"
        className="glass-panel floating-glow rounded-[2rem] p-7 shadow-glass overflow-y-auto max-h-[min(680px,90vh)] scrollbar-hide"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex rounded-full border border-white/10 bg-white/5 p-1"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode("signin"); setStatus(""); }}
            className={`flex-1 rounded-full px-4 py-2 text-sm ${(mode === "signin" || mode === "reset") ? "bg-neon text-slate-950" : "text-slate-300"}`}
          >
            Sign in
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setMode("signup"); setStatus(""); }}
            className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "signup" ? "bg-glow text-slate-950" : "text-slate-300"}`}
          >
            Create account
          </motion.button>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === "signup" && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4 overflow-hidden"
              >
                <motion.label variants={fieldReveal} className="field">
                  <span>Full name</span>
                  <motion.input
                    whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
                    transition={glowTransition}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Aarav Sharma"
                  />
                </motion.label>
                <motion.label variants={fieldReveal} className="field">
                  <span>Phone</span>
                  <motion.input
                    whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
                    transition={glowTransition}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 9876543210"
                  />
                </motion.label>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {!showOtpStep ? (
              <motion.div
                key="login-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <motion.label variants={fieldReveal} className="field">
                  <span>Email</span>
                  <motion.input
                    whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
                    transition={glowTransition}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="owner@example.com"
                  />
                </motion.label>

                {mode !== "reset" && (
                  <motion.label variants={fieldReveal} className="field">
                    <span>Password</span>
                    <motion.input
                      whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
                      transition={glowTransition}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                    />
                  </motion.label>
                )}

                {mode === "reset" ? (
                  <motion.div variants={fieldReveal} className="space-y-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={pending || !email}
                      onClick={triggerPasswordReset}
                      className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <motion.span animate="rest" variants={pulseGlow}>
                        {activeAction === "reset-password" ? "Sending Link..." : "Send Reset Link"}
                      </motion.span>
                    </motion.button>
                    <button 
                      type="button" 
                      onClick={() => { setMode("signin"); setStatus(""); }}
                      className="text-xs text-slate-400 hover:text-white mt-1 text-center w-full block transition-colors"
                    >
                      Back to sign in
                    </button>
                  </motion.div>
                ) : mode === "signin" ? (
                  <motion.div variants={fieldReveal} className="space-y-3 pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={pending || !email || !password}
                      onClick={signIn}
                      className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <motion.span animate="rest" variants={pulseGlow}>
                        {activeAction === "signin" ? "Signing in..." : "Sign In"}
                      </motion.span>
                    </motion.button>
                    <button 
                      type="button" 
                      onClick={() => { setMode("reset"); setStatus(""); }}
                      className="text-xs text-slate-400 hover:text-white mt-1 text-center w-full block transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </motion.div>
                ) : (
                  <motion.div variants={fieldReveal} className="pt-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={pending || !email || !password || !phone}
                      onClick={createAccount}
                      className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {activeAction === "create-account" ? "Creating Account..." : "Create Account"}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 py-4"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">Verify Identity</h3>
                  <p className="mt-2 text-sm text-slate-400">Enter the 6-digit code sent to {phone}</p>
                </div>

                <motion.label variants={fieldReveal} className="field">
                  <span className="text-center w-full block">Verification Code</span>
                  <motion.input
                    whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(16, 185, 129, 0.2)" }}
                    transition={glowTransition}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-[0.5em] font-mono text-neon"
                  />
                </motion.label>

                <motion.button
                  type="button"
                  variants={fieldReveal}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={pending || otp.length < 6}
                  onClick={verifyOtp}
                  className="primary-button w-full bg-emerald-500 text-slate-950"
                >
                  {activeAction === "verify-otp" ? "Verifying..." : "Confirm Verification"}
                </motion.button>

                <button 
                  type="button" 
                  onClick={() => setShowOtpStep(false)}
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  Back to signup
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {status && (
              <motion.p
                key={status}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-sm text-slate-300"
              >
                {status}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
