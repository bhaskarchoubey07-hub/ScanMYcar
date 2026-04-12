"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Shield, 
  Zap, 
  MapPin, 
  Layout, 
  ArrowRight,
  Activity,
  Globe,
  Lock
} from "lucide-react";
import { PageReveal, StaggerGroup } from "@/components/ui/motion-effects";
import { riseIn } from "@/lib/motion";
import { useRef } from "react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    variants={riseIn}
    whileHover={{ 
      y: -10, 
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(56, 189, 248, 0.1)" 
    }}
    className="glass-panel group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 transition-all"
  >
    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-neon/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-20" />
    <div className="relative z-10">
      <div className="inline-flex rounded-2xl bg-white/5 p-3 text-neon shadow-inner">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  </motion.div>
);

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-slate-950 selection:bg-neon selection:text-slate-950">
      {/* Mesh Gradient Backgrounds */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] size-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[10%] size-[50%] rounded-full bg-emerald-600/10 blur-[100px]" />
        <div className="absolute left-[30%] top-[40%] size-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <PageReveal className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        {/* Navigation Bar */}
        <header className="flex h-24 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-colors group-hover:border-neon/50">
              <Shield className="size-6 text-neon" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              SCAN<span className="text-neon">MY</span>CAR
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/auth" className="text-sm font-bold text-slate-400 transition-colors hover:text-white">
              Security Login
            </Link>
            <Link href="/auth" className="primary-button hidden sm:flex">
              Launch Platform
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32">
          <motion.div style={{ opacity, scale }} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-neon shadow-[0_0_20px_rgba(56,189,248,0.2)]"
            >
              <Zap className="size-3 fill-neon" />
              Intelligence Layer V3.0
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-8 text-5xl font-black leading-[1.1] text-white sm:text-7xl lg:text-8xl"
            >
              Secure Vehicle <br />
              <span className="bg-gradient-to-r from-neon via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Identity & Tracking
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl"
            >
              Deploy advanced QR-based identity systems with real-time spatial analytics, 
              AI security monitoring, and instant emergency response protocols.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex flex-wrap justify-center gap-4"
            >
              <Link href="/auth" className="primary-button h-14 px-10 text-lg shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                Start for Free
                <ArrowRight className="ml-2 size-5" />
              </Link>
              <Link href="/auth" className="secondary-button h-14 px-10 text-lg bg-white/5 border-white/10 hover:bg-white/10">
                View Live Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Futuristic Platform Preview (Placeholder UI) */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-24 aspect-[16/9] w-full rounded-[3rem] border border-white/10 bg-slate-900/50 p-4 shadow-2xl backdrop-blur-3xl lg:p-8"
          >
            <div className="h-full w-full overflow-hidden rounded-[2rem] bg-slate-950 relative">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent)]" />
               <div className="absolute top-0 left-0 w-full h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-3">
                  <div className="size-2 rounded-full bg-red-500/50" />
                  <div className="size-2 rounded-full bg-amber-500/50" />
                  <div className="size-2 rounded-full bg-emerald-500/50" />
                  <div className="ml-4 h-5 w-32 rounded-full bg-white/5" />
               </div>
               <div className="flex h-full items-center justify-center">
                  <Activity className="size-16 text-neon/20 animate-pulse" />
                  <p className="absolute bottom-10 text-[10px] font-bold uppercase tracking-[0.5em] text-slate-700">
                    Encrypted Telemetry Active
                  </p>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-5xl">Engineered for absolute safety</h2>
            <p className="mt-4 text-slate-500">Every component built with the highest security standards.</p>
          </div>

          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={Globe}
              title="Spatial Intelligence"
              description="Visualize scan density in real-time with map-based hit-tracking and regional heatmaps."
              delay={0}
            />
            <FeatureCard 
              icon={Activity}
              title="AI Anomaly Engine"
              description="Automated detection for suspicious scan patterns and identity theft attempts."
              delay={0.1}
            />
            <FeatureCard 
              icon={Lock}
              title="Identity Resilience"
              description="Encrypted metadata storage ensuring owner privacy while maintaining responder access."
              delay={0.2}
            />
          </StaggerGroup>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-neon/20 via-slate-900 to-slate-950 p-12 text-center border border-white/10">
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-neon/10 blur-[80px]" />
            <h2 className="relative z-10 text-4xl font-black text-white sm:text-6xl">
              Ready to secure <br className="hidden sm:block" /> your fleet?
            </h2>
            <div className="mt-12 relative z-10">
              <Link href="/auth" className="primary-button h-16 px-12 text-xl inline-flex shadow-[0_0_40px_rgba(56,189,248,0.5)]">
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-700">
            © 2026 SCANMYCAR. ALL SYSTEMS OPERATIONAL.
          </p>
        </footer>
      </PageReveal>
    </main>
  );
}
