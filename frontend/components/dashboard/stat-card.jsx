"use client";

import { motion } from "framer-motion";
import { riseIn } from "@/lib/motion";

export function StatCard({ label, value, accent = "neon", helper }) {
  return (
    <motion.div
      variants={riseIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      whileHover={{
        scale: 1.04,
        y: -4,
        boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.18), 0 22px 60px rgba(56, 189, 248, 0.16)"
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="glass-panel hover-neon rounded-3xl p-5"
    >
      <p className={`text-xs uppercase tracking-[0.35em] ${accent === "glow" ? "text-glow" : "text-neon"}`}>{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-400">{helper}</p>}
    </motion.div>
  );
}
