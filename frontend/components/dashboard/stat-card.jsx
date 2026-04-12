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
        boxShadow: accent === "neon" 
          ? "0 0 40px rgba(56, 189, 248, 0.2)" 
          : "0 0 40px rgba(16, 185, 129, 0.2)"
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`glass-panel group relative overflow-hidden rounded-[2.25rem] p-6 transition-all duration-500`}
    >
      <div className={`absolute -right-4 -top-4 size-24 blur-3xl transition-opacity group-hover:opacity-100 opacity-20 ${
        accent === "neon" ? "bg-neon/30" : "bg-glow/30"
      }`} />
      
      <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${accent === "glow" ? "text-emerald-500" : "text-neon"}`}>
        {label}
      </p>
      
      <div className="mt-5 flex items-baseline gap-2">
        <h3 className="text-5xl font-black tracking-tight text-white">{value}</h3>
      </div>
      
      {helper && (
        <p className="mt-5 text-[11px] font-medium leading-relaxed text-slate-500 group-hover:text-slate-300 transition-colors">
          {helper}
        </p>
      )}

      {/* Modern accent bar */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-700 group-hover:w-full ${
        accent === "glow" ? "bg-emerald-500" : "bg-neon"
      }`} />
    </motion.div>
  );
}
