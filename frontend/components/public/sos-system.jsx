"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Phone, MessageSquare, MapPin, Shield, X, Check } from "lucide-react";
import { formatPhoneHref, formatWhatsAppHref } from "@/lib/utils";

export function SosSystem({ vehicle, location }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSOS = async () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            vehicleId: vehicle.id,
            latitude: location?.latitude || null,
            longitude: location?.longitude || null,
            alertType: "sos",
            message: "CRITICAL: SOS signal triggered from public vehicle page."
          })
        });

        if (response.ok) {
          setIsSuccess(true);
          // Don't close immediately so user can see police/family options
        }
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
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="sos-pulse flex w-full flex-col items-center justify-center gap-3 rounded-[3rem] py-10 shadow-2xl transition-all active:scale-95"
      >
        <AlertCircle size={48} strokeWidth={2.5} />
        <span className="text-xl font-black uppercase tracking-[0.2em]">Trigger Emergency SOS</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-lg overflow-hidden rounded-[2.5rem] border-red-500/30 p-8 shadow-2xl"
            >
              {!isSuccess ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 mb-6">
                    <Shield size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Confirm Emergency</h2>
                  <p className="mt-4 text-slate-400">
                    This will alert the owner and provide you with absolute priority emergency tools. Continue?
                  </p>
                  
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="secondary-button w-full"
                    >
                      <X size={18} /> Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={handleSOS}
                      className="primary-button bg-red-500 text-white w-full border-none"
                    >
                      {pending ? "Triggering..." : "Yes, SOS Now"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <Check size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Emergency Broadcast Active</h3>
                    <p className="mt-2 text-sm text-slate-400 italic">Owner notified. Use the tools below now.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1">
                    <a
                      href={formatPhoneHref("112")}
                      className="flex items-center justify-between rounded-3xl bg-red-500 p-5 text-white transition-transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <Phone fill="currentColor" />
                        <div>
                          <p className="font-bold">Call National Police</p>
                          <p className="text-xs opacity-90">Dial 112 India (Primary)</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href={formatWhatsAppHref(vehicle.emergency_contact, whatsappMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-3xl bg-emerald-600 p-5 text-white transition-transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-4">
                        <MessageSquare fill="currentColor" />
                        <div>
                          <p className="font-bold">Alert Family via WhatsApp</p>
                          <p className="text-xs opacity-90">Emergency Contact: {vehicle.emergency_contact}</p>
                        </div>
                      </div>
                    </a>

                    <a
                      href={googleMapsPoliceLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-3xl bg-slate-800 p-5 text-white transition-transform hover:scale-[1.02] border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <MapPin fill="currentColor" />
                        <div>
                          <p className="font-bold">Find Nearest Police Station</p>
                          <p className="text-xs opacity-90">Opens Google Maps</p>
                        </div>
                      </div>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); setIsSuccess(false); }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Close Control Panel
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
