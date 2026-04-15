"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShieldAlert, 
  X, 
  CheckCircle2,
  Navigation,
  Loader2
} from "lucide-react";
import { formatPhoneHref, formatWhatsAppHref, getApiUrl } from "@/lib/utils";
import axios from "axios";

const API_BASE = `${getApiUrl()}/alerts`;

export function SosSystem({ vehicle, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSOS = async () => {
    startTransition(async () => {
      try {
        await axios.post(`${API_BASE}/trigger`, {
          vehicle_id: vehicle.id,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          alert_type: "sos",
          message: "IMMEDIATE SOS: Public scanner has triggered an emergency broadcast."
        });
        setIsSuccess(true);
      } catch (err) {
        console.error("SOS Trigger Failed:", err);
      }
    });
  };

  const mapsLink = location 
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : null;

  const whatsappMessage = `EMERGENCY! My vehicle ${vehicle.vehicle_number} is in danger. ${mapsLink ? `Location link: ${mapsLink}` : 'Location unknown.'}`;
  
  const googleMapsPoliceLink = location
    ? `https://www.google.com/maps/search/police+station/@${location.latitude},${location.longitude},15z`
    : `https://www.google.com/maps/search/police+station/`;

  return (
    <div className="w-full relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="sos-pulse-premium group flex w-full flex-col items-center justify-center gap-4 rounded-[2.5rem] py-12 transition-all active:scale-95 bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
      >
        <div className="relative">
          <ShieldAlert size={56} className="text-white relative z-10" strokeWidth={2.5} />
          <div className="absolute inset-0 bg-white blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="text-center">
          <span className="block text-2xl font-black uppercase tracking-[0.25em] text-white">Emergency SOS</span>
          <span className="block mt-1 text-[10px] font-bold text-red-100 uppercase tracking-widest opacity-80">Trigger Owner Broadast</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="glass-panel w-full max-w-lg overflow-hidden rounded-[3rem] border-red-500/40 p-10 shadow-[0_0_80px_rgba(239,68,68,0.15)]"
            >
              {!isSuccess ? (
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-red-500/10 text-red-500 mb-8 border border-red-500/20">
                    <AlertTriangle size={48} className="animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Confirm Escalation</h2>
                  <p className="mt-4 text-slate-400 text-lg leading-relaxed">
                    This triggers an immediate <span className="text-white font-bold underline decoration-red-500">Emergency Alert</span> to the owner. This action cannot be undone.
                  </p>
                  
                  <div className="mt-10 grid gap-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSOS}
                      className="w-full h-18 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
                    >
                      {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate SOS Protocol"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-6 border border-emerald-500/20">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Owner Notified</h3>
                    <p className="mt-3 text-slate-400 text-sm italic">Emergency telemetry broadcasted successfully.</p>
                  </div>

                  <div className="grid gap-4">
                    <a
                      href={formatPhoneHref("112")}
                      className="flex items-center justify-between rounded-3xl bg-red-600/90 p-6 text-white transition-all hover:scale-[1.03] shadow-lg border border-red-400/20"
                    >
                      <div className="flex items-center gap-4">
                        <Phone size={28} fill="currentColor" />
                        <div>
                          <p className="font-black uppercase tracking-widest text-sm">Police Control (112)</p>
                          <p className="text-[10px] uppercase font-bold opacity-70">Immediate Law Enforcement</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href={formatWhatsAppHref(vehicle.emergency_contact, whatsappMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-3xl bg-emerald-600/90 p-6 text-white transition-all hover:scale-[1.03] shadow-lg border border-emerald-400/20"
                    >
                      <div className="flex items-center gap-4">
                        <MessageSquare size={28} fill="currentColor" />
                        <div>
                          <p className="font-black uppercase tracking-widest text-sm">Family Alert</p>
                          <p className="text-[10px] uppercase font-bold opacity-70">Emergency Contact: {vehicle.emergency_contact}</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href={googleMapsPoliceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-3xl bg-white/5 p-6 text-white transition-all hover:scale-[1.03] border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <Navigation size={28} className="text-sky-400" />
                        <div>
                          <p className="font-black uppercase tracking-widest text-sm">Nearest Help</p>
                          <p className="text-[10px] uppercase font-bold opacity-70">Detect Closest Support Center</p>
                        </div>
                      </div>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setIsSuccess(false); }}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Close & Monitor
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
