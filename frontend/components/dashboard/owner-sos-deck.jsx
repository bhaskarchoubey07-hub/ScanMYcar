"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, MapPin, Zap, X, AlertCircle } from "lucide-react";

export function OwnerSosDeck({ vehicles = [] }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const triggerOwnerSOS = () => {
    if (!selectedVehicle) return;

    startTransition(async () => {
      try {
        // Owners trigger SOS with higher priority / different context
        const response = await fetch("/api/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            vehicleId: selectedVehicle.id,
            alertType: "sos",
            message: "OWNER SOS: The vehicle owner has manually triggered an emergency signal from their dashboard."
          })
        });

        if (response.ok) {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setSelectedVehicle(null);
          }, 4000);
        }
      } catch (err) {
        console.error("Owner SOS Trigger Error:", err);
      }
    });
  };

  if (vehicles.length === 0) return null;

  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl p-6 border border-red-500/20 bg-red-500/[0.02]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500 size-5" />
            Owner Emergency Deck
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Rapid SOS Broadcast</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVehicle(v)}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
              selectedVehicle?.id === v.id 
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {v.vehicle_number}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Broadcast SOS for {selectedVehicle.vehicle_number}?</p>
                <button onClick={() => setSelectedVehicle(null)} className="text-slate-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 text-emerald-400 font-bold text-xs"
                >
                  <Zap className="size-4 animate-pulse" />
                  EMERGENCY SIGNAL BROADCASTED SUCCESSFULLY
                </motion.div>
              ) : (
                <button
                  onClick={triggerOwnerSOS}
                  disabled={pending}
                  className="w-full primary-button bg-red-600 text-white font-black uppercase tracking-widest text-xs py-3 border-none hover:bg-red-500 transition-colors"
                >
                  {pending ? "Broadcasting..." : "Execute SOS Protocol"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none">
        <div className="size-1.5 rounded-full bg-red-500 animate-ping" />
      </div>
    </div>
  );
}
