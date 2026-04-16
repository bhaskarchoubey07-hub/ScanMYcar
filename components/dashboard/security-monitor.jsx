"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Zap, Globe } from "lucide-react";
import { useMemo } from "react";

export function SecurityMonitor({ scans = [] }) {
  const anomalies = useMemo(() => {
    const results = [];
    if (!scans.length) return results;

    // 1. Velocity Check (> 5 scans in a short period)
    const recentScans = scans.filter(s => {
      const diff = Date.now() - new Date(s.created_at).getTime();
      return diff < 10 * 60 * 1000; // Last 10 mins
    });

    if (recentScans.length > 5) {
      results.push({
        id: "velocity",
        type: "High Velocity",
        message: "Unusually high scan frequency detected in 10-minute window.",
        severity: "critical",
        icon: Zap
      });
    }

    // 2. Geospatial Anomaly (Multiple cities in a short window)
    const cities = new Set(recentScans.map(s => s.city).filter(Boolean));
    if (cities.size > 1) {
      results.push({
        id: "geospatial",
        type: "Geospatial Anomaly",
        message: "Identity interactions detected across multiple cities simultaneously.",
        severity: "warning",
        icon: Globe
      });
    }

    return results;
  }, [scans]);

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl p-6 border border-white/10 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AI Security Monitor</h3>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
          anomalies.length ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        }`}>
          {anomalies.length ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
          {anomalies.length ? "Issue Detected" : "System Secure"}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {anomalies.length ? (
            anomalies.map((anomaly) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative rounded-2xl border p-4 ${
                  anomaly.severity === "critical" 
                    ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${
                    anomaly.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    <anomaly.icon className="size-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      anomaly.severity === "critical" ? "text-red-400" : "text-amber-400"
                    }`}>{anomaly.type}</p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{anomaly.message}</p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="safe-state-guard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="rounded-full bg-slate-900 border border-white/5 p-4 text-slate-600">
                <ShieldCheck className="size-8" />
              </div>
              <p className="mt-4 text-sm text-slate-500 italic">No anomalies detected in recent activity.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Futuristic scanning animation */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-50" />
    </div>
  );
}
