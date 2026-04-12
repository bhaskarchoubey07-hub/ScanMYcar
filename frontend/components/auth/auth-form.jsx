"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  delayedRise,
  fieldReveal,
  otpReveal,
  pageReveal,
  panelReveal,
  pulseGlow,
  riseIn,
  staggerContainer
} from "@/lib/motion";
import { getAuthRedirectUrl } from "@/lib/utils";

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

  if (normalized.includes("rate limit")) {
    return "Too many OTP requests. Use Quick Login or wait 30 seconds.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Wrong email or password. Try Quick Login again or create an account.";
  }

  if (normalized.includes("invalid token") || normalized.includes("token")) {
    return "Invalid OTP. Please check the code and try again.";
  }

  return message || "Something went wrong. Please try again.";
}

export function AuthForm() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [activeAction, setActiveAction] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!cooldown) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const completeAuth = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const sendOtp = () => {
    if (cooldown > 0) {
      setStatus(`Too many OTP requests. Use Quick Login or wait ${cooldown} seconds.`);
      return;
    }

    startTransition(async () => {
      setActiveAction("otp");
      setStatus("");
      const redirectUrl = getAuthRedirectUrl();
      console.info("Supabase OTP redirect URL:", redirectUrl);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone
          }
        }
      });

      if (error) {
        setStatus(formatAuthMessage(error.message));
        if (String(error.message || "").toLowerCase().includes("rate limit")) {
          setCooldown(30);
        }
        setActiveAction("");
        return;
      }

      setCooldown(30);
      setStatus("OTP sent. Check your email for the code or secure sign-in link.");
      setActiveAction("");
    });
  };

  const verifyOtp = () => {
    startTransition(async () => {
      setActiveAction("verify");
      setStatus("");

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email"
      });

      if (error) {
        setStatus(formatAuthMessage(error.message));
        setActiveAction("");
        return;
      }

      completeAuth();
    });
  };

  const signInWithPassword = async () => {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const signUpWithPassword = async () => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          full_name: fullName,
          phone
        }
      }
    });
  };

  const quickLogin = () => {
    startTransition(async () => {
      setActiveAction("quick-login");
      setStatus("");

      const loginResult = await signInWithPassword();
      if (!loginResult.error && loginResult.data.session) {
        completeAuth();
        return;
      }

      const signUpResult = await signUpWithPassword();

      if (signUpResult.error) {
        const normalized = String(signUpResult.error.message || "").toLowerCase();
        if (normalized.includes("already registered") || normalized.includes("user already registered")) {
          setStatus("Wrong password. This account already exists, so please try Quick Login again with the correct password.");
        } else {
          setStatus(formatAuthMessage(signUpResult.error.message));
        }
        setActiveAction("");
        return;
      }

      const postSignUpLogin = await signInWithPassword();
      if (postSignUpLogin.error) {
        setStatus(formatAuthMessage(postSignUpLogin.error.message));
        setActiveAction("");
        return;
      }

      completeAuth();
    });
  };

  const createAccount = () => {
    startTransition(async () => {
      setActiveAction("create-account");
      setStatus("");

      const { data, error } = await signUpWithPassword();

      if (error) {
        setStatus(formatAuthMessage(error.message));
        setActiveAction("");
        return;
      }

      if (data.session) {
        completeAuth();
        return;
      }

      const loginResult = await signInWithPassword();
      if (!loginResult.error && loginResult.data.session) {
        completeAuth();
        return;
      }

      setStatus("Account created. If your project requires email confirmation, check your inbox and then sign in.");
      setActiveAction("");
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.span
          variants={delayedRise(0.04)}
          className="inline-flex rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-neon"
        >
          Email OTP Authentication
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
        className="glass-panel floating-glow rounded-[2rem] p-7 shadow-glass"
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
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === "signin" ? "bg-neon text-slate-950" : "text-slate-300"}`}
          >
            Sign in
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode("signup")}
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

          <motion.label variants={fieldReveal} className="field">
            <span>Password</span>
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
              transition={glowTransition}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Use password for Quick Login"
            />
          </motion.label>

          <motion.button
            type="button"
            variants={fieldReveal}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            disabled={pending || !email || cooldown > 0}
            onClick={sendOtp}
            className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            <motion.span animate="rest" variants={pulseGlow}>
              {activeAction === "otp" ? "Sending..." : cooldown > 0 ? `Send OTP (${cooldown}s)` : "Send OTP"}
            </motion.span>
          </motion.button>

          <motion.label variants={otpReveal} className="field">
            <span>Enter OTP</span>
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)" }}
              transition={glowTransition}
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="123456"
            />
          </motion.label>

          <motion.button
            type="button"
            variants={fieldReveal}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={pending || otp.length < 6}
            onClick={verifyOtp}
            className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {activeAction === "verify" ? "Verifying..." : "Verify & continue"}
          </motion.button>

          <motion.div variants={staggerContainer} className="grid gap-3 sm:grid-cols-2">
            <motion.button
              type="button"
              variants={fieldReveal}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={pending || !email || !password}
              onClick={quickLogin}
              className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {activeAction === "quick-login" ? "Working..." : "Quick Login (No OTP)"}
            </motion.button>

            <motion.button
              type="button"
              variants={fieldReveal}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={pending || !email || !password}
              onClick={createAccount}
              className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
            >
              {activeAction === "create-account" ? "Creating..." : "Create Account"}
            </motion.button>
          </motion.div>

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
