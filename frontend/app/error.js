"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Critical System Anomaly:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel floating-glow w-full max-w-md rounded-[2.5rem] p-10 shadow-glass"
      >
        <div className="flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4 text-red-400 border border-red-500/20">
            <AlertCircle className="size-8" />
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          System Anomaly Detected
        </h1>
        
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          A client-side exception has occurred in the neural network. We've logged the incident and isolated the process.
        </p>

        <div className="mt-8 space-y-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="primary-button w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="size-4" />
            System Reset
          </motion.button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors"
          >
            Back to Neural Core
          </button>
        </div>
      </motion.div>

      <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-slate-600 font-black">
        Protocol: Stability_Guard_v2.0
      </p>
    </div>
  );
}
