"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import Cookies from "js-cookie";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  pageReveal, 
  staggerContainer, 
  fieldReveal, 
  panelReveal, 
  riseIn, 
  delayedRise 
} from "@/lib/motion";

// Configuration
const API_BASE = "http://localhost:5000/api/auth";

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
  isToggled,
  inputRef // For focusing
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative group w-full mb-6 z-20">
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
            ref={inputRef}
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
  const captchaRef = useRef(null);
  const otpRef = useRef(null);

  // States
  const [mode, setMode] = useState("signin"); // signin, signup, mobile, forgot
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });
  
  const [errors, setErrors] = useState({});

  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus OTP
  useEffect(() => {
    if (showOtpStep && otpRef.current) {
      otpRef.current.focus();
    }
  }, [showOtpStep]);

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
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "10-digit mobile required";
      
      if (formData.password.length < 8) {
        newErrors.password = "Min 8 characters required";
      } else if (!formData.password.match(/(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])/)) {
        newErrors.password = "Include A-Z, 0-9, and @#$";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (mode === "signin") {
      if (!formData.email) newErrors.email = "Email/Mobile required";
      if (!formData.password) newErrors.password = "Password required";
    } else if (mode === "mobile") {
      if (!formData.phone || formData.phone.length !== 10) newErrors.phone = "10-digit mobile required";
    } else if (mode === "forgot") {
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Valid email required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate() || !captchaVerified) {
      if (!captchaVerified) toast.error("Complete reCAPTCHA verification");
      return;
    }

    startTransition(async () => {
      try {
        const res = await axios.post(`${API_BASE}/signup`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        if (res.data.token) {
          Cookies.set("auth-token", res.data.token, { expires: rememberMe ? 7 : 1 }); 
        }
        toast.success("Account created successfully!");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(err.response?.data?.message || "Signup failed");
        captchaRef.current?.reset();
        setCaptchaVerified(false);
      }
    });
  };

  const handleSignin = async () => {
    if (!validate() || !captchaVerified) return;

    startTransition(async () => {
      try {
        const res = await axios.post(`${API_BASE}/login`, {
          identifier: formData.email,
          password: formData.password
        });
        if (res.data.token) {
          Cookies.set("auth-token", res.data.token, { expires: rememberMe ? 7 : 1 });
        }
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid credentials");
        captchaRef.current?.reset();
        setCaptchaVerified(false);
      }
    });
  };

  const handleSendOtp = async () => {
    if (!validate()) return;

    startTransition(async () => {
      try {
        await axios.post(`${API_BASE}/send-otp`, { mobile: formData.phone });
        setShowOtpStep(true);
        setResendTimer(30);
        toast.success("OTP sent successfully!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send OTP");
      }
    });
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length < 6) {
      setErrors({ otp: "Enter valid 6-digit OTP" });
      return;
    }

    startTransition(async () => {
      try {
        const res = await axios.post(`${API_BASE}/verify-otp`, {
          mobile: formData.phone,
          code: formData.otp
        });
        if (res.data.token) {
          Cookies.set("auth-token", res.data.token, { expires: 7 });
        }
        toast.success("Identity verified!");
        router.push("/dashboard");
        router.refresh();
      } catch (err) {
        toast.error("Invalid or expired OTP");
      }
    });
  };

  const handleForgotPassword = async () => {
    if (!validate()) return;
    startTransition(async () => {
      try {
        await axios.post(`${API_BASE}/forgot-password`, { email: formData.email });
        toast.success("Reset link sent if account exists.");
        setMode("signin");
      } catch (err) {
        toast.error("Process failed. Try again.");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={pageReveal}
        className="max-w-6xl w-full grid lg:grid-cols-[1fr_500px] gap-12 items-center relative z-10"
      >
        {/* Brand Side */}
        <div className="hidden lg:block space-y-8 pointer-events-none">
          <motion.div variants={riseIn} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <ShieldCheck className="text-slate-950 w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">ScanMyCar</h2>
          </motion.div>
          
          <motion.h1 variants={delayedRise(0.1)} className="text-6xl font-extrabold text-white leading-tight">
            Next-Gen <span className="text-emerald-400">Fintech-Grade</span> Identity.
          </motion.h1>
          
          <motion.p variants={delayedRise(0.2)} className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Secure vehicle verification and emergency response platform built with institutional-grade security.
          </motion.p>

          <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-6 pt-4">
            {[
              { label: "Bank-Grade Encryption", icon: Lock },
              { label: "Anti-Fraud AI", icon: Smartphone },
              { label: "Real-time Audits", icon: CreditCard },
              { label: "Trusted by 50K+", icon: User }
            ].map((item, idx) => (
              <motion.div key={idx} variants={riseIn} className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <item.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div 
          variants={panelReveal}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative z-30"
        >
          {/* Tabs */}
          {mode !== "forgot" && (
            <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-10 border border-white/5 relative z-40">
              {[
                { id: "signin", label: "Sign In" },
                { id: "mobile", label: "Mobile" },
                { id: "signup", label: "Create Account" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setShowOtpStep(false); setErrors({}); }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                    mode === tab.id ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showOtpStep ? (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {mode === "forgot" && (
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Account Recovery</h3>
                    <p className="text-slate-400 text-sm">Enter your registered email to receive a reset link</p>
                  </div>
                )}

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
                  label={mode === "mobile" ? "Mobile Number" : "Email Address"} 
                  icon={mode === "mobile" ? Phone : Mail} 
                  type={mode === "mobile" ? "tel" : "email"}
                  value={mode === "mobile" ? formData.phone : formData.email} 
                  onChange={v => updateField(mode === "mobile" ? "phone" : "email", v)}
                  error={mode === "mobile" ? errors.phone : errors.email}
                />

                {(mode === "signin" || mode === "signup") && (
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
                )}
                
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

                {/* reCAPTCHA */}
                <div className="flex justify-center mb-8 transform scale-90 origin-center bg-slate-900/40 p-3 rounded-2xl border border-white/5 z-50 relative">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(val) => setCaptchaVerified(!!val)}
                    theme="dark"
                    ref={captchaRef}
                  />
                </div>

                <div className="space-y-4">
                  <button
                    onClick={mode === "signup" ? handleSignup : mode === "signin" ? handleSignin : mode === "mobile" ? handleSendOtp : handleForgotPassword}
                    disabled={isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 h-16 z-50 relative"
                  >
                    {isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                    ) : (
                      <>
                        {mode === "signup" ? "Create Account" : mode === "signin" ? "Sign Integrity" : mode === "mobile" ? "Access Vault" : "Send Recovery Link"}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between px-2 pt-2">
                    {mode !== "forgot" ? (
                      <>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 appearance-none checked:bg-emerald-500 transition-all cursor-pointer" 
                          />
                          <span className="group-hover:text-slate-300 transition-colors uppercase tracking-wider">Remember ID</span>
                        </label>
                        <button 
                          onClick={() => setMode("forgot")}
                          className="text-xs font-bold text-slate-500 hover:text-emerald-400 tracking-widest transition-colors uppercase"
                        >
                          Forgot Link?
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setMode("signin")}
                        className="text-xs font-bold text-slate-500 hover:text-emerald-400 tracking-widest transition-colors uppercase mx-auto"
                      >
                        Back to Security Check
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-3">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Smartphone className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">Trust Verification</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    Sequence sent to <span className="text-emerald-400 font-bold">{formData.phone}</span>
                  </p>
                </div>

                <AuthInput 
                  label="6-Digit OTP" 
                  icon={ShieldCheck} 
                  inputRef={otpRef}
                  value={formData.otp} 
                  onChange={v => updateField("otp", v.replace(/\D/g, "").slice(0, 6))}
                  error={errors.otp}
                  placeholder="000000"
                />

                <div className="space-y-4">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 flex items-center justify-center h-16 shadow-[0_10px_30px_rgba(16,185,129,0.3)] z-50 relative"
                  >
                    {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirm Integrity"}
                  </button>
                  
                  <button 
                    disabled={resendTimer > 0 || isPending}
                    onClick={handleSendOtp}
                    className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend Sequence in ${resendTimer}s` : "Resend Security Code"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      
      {/* Dynamic Status Badges */}
      <div className="fixed bottom-8 left-8 flex gap-4 pointer-events-none z-50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node: Active</span>
        </div>
      </div>
    </div>
  );
}
