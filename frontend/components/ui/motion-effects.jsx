"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { pageReveal, staggerContainer, staggerFast } from "@/lib/motion";

export function PageReveal({ children, className }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className={cn("relative", className)}>
      {children}
    </motion.div>
  );
}

export function StaggerGroup({ children, className, fast = false }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={fast ? staggerFast : staggerContainer} className={className}>
      {children}
    </motion.div>
  );
}
