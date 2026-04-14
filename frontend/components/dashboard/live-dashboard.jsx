"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/browser";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin } from "lucide-react";

const LiveDashboardContext = createContext(null);

export function useLiveDashboard() {
  const context = useContext(LiveDashboardContext);
  if (!context) {
    return {
      stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 },
      activity: [],
      liveScans: []
    };
  }
  return context;
}

export function LiveDashboardProvider({ 
  initialStats, 
  initialActivity, 
  userId, 
  children 
}) {
  // Use Browser Client for REALTIME LISTENING ONLY - All writes are handled by the Node.js API
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState(initialStats || { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 });
  const [activity, setActivity] = useState(initialActivity || []);
  const [liveScans, setLiveScans] = useState([]);
  const [newScanToast, setNewScanToast] = useState(null);

  useEffect(() => {
    if (!supabase || !userId) return;

    // --- SECURE REALTIME ARCHITECTURE ---
    // The frontend strictly listens for broadcasted events. 
    // Business logic (Alerting, Validation, Persistence) has been centralized in the Node.js Backend.

    const scanChannel = supabase
      .channel(`scans-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        async (payload) => {
          const newScan = payload.new;
          try {
            // Check if this scan belongs to the current user (Owner Logic)
            const { data: vehicle } = await supabase
              .from("vehicles")
              .select("user_id, vehicle_number")
              .eq("id", newScan.vehicle_id)
              .single();

            if (vehicle && vehicle.user_id === userId) {
              setStats(prev => {
                const current = prev || { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 };
                return {
                  ...current,
                  totalScans: (current.totalScans || 0) + 1
                };
              });

              setLiveScans(prev => [newScan, ...prev].slice(0, 50));

              const entry = {
                id: newScan.id,
                type: "scan",
                created_at: newScan.created_at,
                title: "Live Scan Detected",
                description: `${newScan.city || "Anonymous Location"} • Vehicle: ${vehicle.vehicle_number}`,
                isLive: true
              };

              setActivity(prev => [entry, ...prev].slice(0, 10));

              setNewScanToast({
                title: "Inbound Telemetry",
                detail: `Scan recorded for ${vehicle.vehicle_number}`,
                location: newScan.city || "Location Pending"
              });

              setTimeout(() => setNewScanToast(null), 5000);
            }
          } catch (err) {
            console.error("Telemetry Processing Error:", err);
          }
        }
      )
      .subscribe();

    const alertChannel = supabase
      .channel(`alerts-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        async (payload) => {
          const newAlert = payload.new;
          try {
            const { data: vehicle } = await supabase
              .from("vehicles")
              .select("user_id, vehicle_number")
              .eq("id", newAlert.vehicle_id)
              .single();

            if (vehicle && vehicle.user_id === userId) {
              setStats(prev => {
                const current = prev || { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 };
                return {
                  ...current,
                  activeAlerts: (current.activeAlerts || 0) + 1
                };
              });

              const entry = {
                id: newAlert.id,
                type: "alert",
                created_at: newAlert.created_at,
                title: `SOS: ${newAlert.alert_type?.toUpperCase()}`,
                description: newAlert.message,
                isLive: true
              };

              setActivity(prev => [entry, ...prev].slice(0, 10));
            }
          } catch (err) {
            console.error("Alert Telemetry Error:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeAllChannels();
    };
  }, [supabase, userId]);

  return (
    <LiveDashboardContext.Provider value={{ stats, activity, liveScans }}>
      <AnimatePresence>
        {newScanToast && (
          <motion.div
            key="telemetry-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400">
                  <Zap className="size-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight">{newScanToast.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{newScanToast.detail}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    <MapPin className="size-3" />
                    {newScanToast.location}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </LiveDashboardContext.Provider>
  );
}
