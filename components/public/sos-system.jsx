"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2,
  Navigation,
  Loader2
} from "lucide-react";
import { formatPhoneHref, formatWhatsAppHref } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

export function SosSystem({ vehicle, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const handleSOS = async () => {
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('alerts')
          .insert([{
            vehicle_id: vehicle.id,
            alert_type: "sos",
            message: "CRITICAL SOS: Emergency signal triggered from public identity profile.",
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            status: 'open'
          }]);

        if (error) throw error;
        setIsSuccess(true);
      } catch (err) {
        console.error("SOS Trigger Failed:", err);
      }
    });
  };

  const mapsLink = location 
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : null;

  const whatsappMessage = `EMERGENCY! My vehicle ${vehicle.vehicle_number} is in danger. ${mapsLink ? `Location: ${mapsLink}` : 'Location unknown.'}`;
  
  const googleMapsPoliceLink = location
    ? `https://www.google.com/maps/search/police+station/@${location.latitude},${location.longitude},15z`
    : `https://www.google.com/maps/search/police+station/`;

  return (
    <div className="w-full relative z-40">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full flex-col items-center justify-center gap-4 rounded-[2.5rem] py-10 transition-all active:scale-95 bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] hover:bg-red-500"
      >
        <div className="relative">
          <ShieldAlert size={56} className="text-white relative z-10" />
          <div className="absolute inset-0 bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
        </div>
        <div className="text-center">
          <span className="block text-2xl font-black uppercase tracking-widest text-white">Emergency SOS</span>
          <span className="block text-[10px] font-bold text-red-100 uppercase tracking-widest opacity-70">Tap to Alert Owner</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 w-full max-w-lg overflow-hidden rounded-[3rem] border border-red-500/40 p-8 shadow-2xl"
            >
              {!isSuccess ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-red-500/10 text-red-500 mb-8 border border-red-500/20">
                    <AlertTriangle size={40} className="animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic">Confirm Emergency</h2>
                  <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                    This will broadcast an immediate SOS alert to the vehicle owner. Only use in real emergencies.
                  </p>
                  
                  <div className="mt-8 grid gap-4">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSOS}
                      className="w-full h-16 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                      {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Broadcast SOS"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic">SOS Broadcast Sent</h3>
                  </div>

                  <div className="grid gap-3">
                    <a
                      href={formatPhoneHref("112")}
                      className="flex items-center gap-4 rounded-2xl bg-red-600 p-5 text-white shadow-lg"
                    >
                      <Phone size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm">Call Police (112)</p>
                        <p className="text-[10px] opacity-70">Immediate police intervention</p>
                      </div>
                    </a>

                    <a
                      href={formatWhatsAppHref(vehicle.emergency_contact, whatsappMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 rounded-2xl bg-emerald-600 p-5 text-white shadow-lg"
                    >
                      <MessageSquare size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm">Alert Family</p>
                        <p className="text-[10px] opacity-70">WhatsApp SOS message</p>
                      </div>
                    </a>

                    <a
                      href={googleMapsPoliceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 rounded-2xl bg-white/5 p-5 text-white border border-white/10"
                    >
                      <Navigation size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm">Nearby Support</p>
                        <p className="text-[10px] opacity-70">Find nearest police station</p>
                      </div>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setIsSuccess(false); }}
                    className="w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white"
                  >
                    Done
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
