"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone,
  Loader2,
  Car
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

/**
 * Premium Floating Label Input Component
 */
function AuthInput({ 
  label, 
  icon: Icon, 
  type = "text", 
  value, 
  onChange, 
  placeholder = " ", 
  error, 
  required = true,
  disabled = false,
  showToggle = false,
  onToggle,
  isToggled
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative group w-full mb-6">
      <div 
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
          error 
            ? "border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
            : isFocused 
              ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
              : "border-white/10 bg-white/5 group-hover:border-white/20"
        }`}
      >
        {Icon && (
          <Icon className={`w-5 h-5 transition-colors duration-300 ${
            error ? "text-red-400" : isFocused ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
          }`} />
        )}
        
        <div className="relative flex-1">
          <input
            type={showToggle ? (isToggled ? "text" : "password") : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-transparent outline-none text-white text-base font-medium placeholder-transparent disabled:opacity-50"
            placeholder={placeholder}
          />
          <label 
            className={`absolute left-0 pointer-events-none transition-all duration-300 ${
              isFocused || value 
                ? "-top-6 text-xs font-semibold text-emerald-400 uppercase tracking-widest" 
                : "top-0 text-base text-slate-500"
            }`}
          >
            {label}
          </label>
        </div>

        {showToggle && (
          <button 
            type="button" 
            onClick={onToggle}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            {isToggled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="absolute -bottom-5 left-2 text-[10px] uppercase font-bold tracking-widest text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AuthForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // States
  const [mode, setMode] = useState("signin"); // signin, signup
  const [showPassword, setShowPassword] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (mode === "signup") {
      if (!formData.name) newErrors.name = "Full name required";
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email required";
      if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Valid contact required";
      if (formData.password.length < 6) newErrors.password = "Min 6 characters required";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords match failed";
    } else {
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email required";
      if (!formData.password) newErrors.password = "Password required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim(),
              phone: formData.phone.trim()
            }
          }
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          toast.error("Email already registered. Try logging in.");
          return;
        }

        toast.success("Registration successful!");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(err.message || "Signup failed");
      }
    });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        });

        if (error) throw error;

        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(err.message || "Invalid credentials");
      }
    });
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-4">
            <Car size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400">
            {mode === "signin" 
              ? "Access your smart vehicle identity dashboard" 
              : "Register to manage your vehicle identity network"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                mode === "signin" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                mode === "signup" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={mode === "signin" ? handleSignin : handleSignup}>
            {mode === "signup" && (
              <AuthInput 
                label="Full Name" 
                icon={User} 
                value={formData.name} 
                onChange={v => updateField("name", v)} 
                error={errors.name}
              />
            )}

            <AuthInput 
              label="Email Address" 
              icon={Mail} 
              type="email"
              value={formData.email} 
              onChange={v => updateField("email", v)}
              error={errors.email}
            />

            {mode === "signup" && (
              <AuthInput 
                label="Phone Number" 
                icon={Smartphone} 
                type="tel"
                value={formData.phone} 
                onChange={v => updateField("phone", v)} 
                error={errors.phone}
              />
            )}

            <AuthInput 
              label="Password" 
              icon={Lock} 
              type="password"
              value={formData.password} 
              onChange={v => updateField("password", v)}
              showToggle 
              isToggled={showPassword} 
              onToggle={() => setShowPassword(!showPassword)}
              error={errors.password}
            />
            
            {mode === "signup" && (
              <AuthInput 
                label="Confirm Password" 
                icon={ShieldCheck} 
                type="password"
                value={formData.confirmPassword} 
                onChange={v => updateField("confirmPassword", v)}
                error={errors.confirmPassword}
              />
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 mt-4"
            >
              {isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Create Account" : "Access System"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-slate-500">
          Powered by Supabase & Next.js Identity Layer
        </p>
      </motion.div>
    </div>
  );
}
