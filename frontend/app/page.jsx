"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageReveal, StaggerGroup } from "@/components/ui/motion-effects";
import { delayedRise, riseIn } from "@/lib/motion";

const features = [
  {
    title: "Dynamic Vehicle Identity",
    copy: "Every vehicle gets a dedicated QR profile with owner contact actions and optional medical notes."
  },
  {
    title: "Emergency Response Layer",
    copy: "SOS alerts, emergency contact visibility, and browser geolocation give first responders immediate context."
  },
  {
    title: "Operations Dashboard",
    copy: "Track scans, review alerts, export CSV reports, and manage fleet activity from one glassmorphism admin panel."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PageReveal className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="glass-panel floating-glow overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-glass sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <StaggerGroup className="space-y-0">
              <motion.span
                variants={delayedRise(0.05)}
                className="inline-flex rounded-full border border-glow/30 bg-glow/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-glow"
              >
                SaaS Ready
              </motion.span>
              <motion.h1
                variants={delayedRise(0.14)}
                className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl"
              >
                Smart Vehicle Identity & Emergency Response System
              </motion.h1>
              <motion.p variants={delayedRise(0.22)} className="mt-6 max-w-2xl text-lg text-slate-300">
                A full-stack vehicle safety platform built with Next.js, Supabase Auth, PostgreSQL, and Storage for
                mobile-first QR identity and real-time emergency workflows.
              </motion.p>
              <motion.div variants={delayedRise(0.3)} className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth" className="primary-button">
                    Launch dashboard
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.985 }}>
                  <Link href="/dashboard/admin" className="secondary-button">
                    Admin preview
                  </Link>
                </motion.div>
              </motion.div>
            </StaggerGroup>

            <StaggerGroup className="grid gap-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={riseIn}
                  initial={{ scale: 1, y: 0 }}
                  whileHover={{
                    scale: 1.05,
                    y: -6,
                    boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.18), 0 24px 64px rgba(52, 211, 153, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="hover-neon rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
                >
                  <p className="text-sm uppercase tracking-[0.35em] text-neon">Feature</p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">{feature.title}</h2>
                  <p className="mt-3 text-slate-400">{feature.copy}</p>
                </motion.div>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </PageReveal>
    </main>
  );
}
