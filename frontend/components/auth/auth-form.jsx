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
  const [status, setStatus] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // Check localStorage on load
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      router.push("/dashboard");
    }
  }, [router]);

  const completeAuth = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/dashboard");
    router.refresh();
  };

  const validateInputs = () => {
    if (!email.trim()) {
      return "Email is required.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const signIn = () => {
    startTransition(async () => {
      setActiveAction("signin");
      setStatus("");

      if (!email || !password) {
        setStatus("Email and password are required.");
        setActiveAction("");
        return;
      }

      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .limit(1);

      if (error) {
        setStatus("System error. Please try again.");
        setActiveAction("");
        return;
      }

      if (!users || users.length === 0) {
        setStatus("Invalid email or password");
        setActiveAction("");
        return;
      }

      completeAuth(users[0]);
    });
  };

  const createAccount = () => {
    startTransition(async () => {
      setActiveAction("create-account");
      setStatus("");

      if (!email || !password) {
        setStatus("Email and password are required.");
        setActiveAction("");
        return;
      }

      if (password.length < 6) {
        setStatus("Password must be at least 6 characters.");
        setActiveAction("");
        return;
      }

      // Check if user exists
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (existing && existing.length > 0) {
        setStatus("User already exists");
        setActiveAction("");
        return;
      }

      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            email,
            password,
            full_name: fullName,
            phone
          }
        ])
        .select();

      if (error) {
        setStatus("Signup failed. Ensure the 'users' table has a password column.");
        setActiveAction("");
        return;
      }

      completeAuth(newUser[0]);
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.span
          variants={delayedRise(0.04)}
          className="inline-flex rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-neon"
        >
          Manual Local Authentication
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
              placeholder="Enter your password"
            />
          </motion.label>

          <motion.button
            type="button"
            variants={fieldReveal}
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

          <motion.button
            type="button"
            variants={fieldReveal}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={pending || !email || !password}
            onClick={createAccount}
            className="secondary-button w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {activeAction === "create-account" ? "Creating Account..." : "Create Account"}
          </motion.button>

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
