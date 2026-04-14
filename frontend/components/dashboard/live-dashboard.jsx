"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/browser";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin } from "lucide-react";

const LiveDashboardContext = createContext(null);

export function useLiveDashboard() {
  const context = useContext(LiveDashboardContext);
  if (!context) {
    // Return safe defaults during pre-rendering/build
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
  const supabase = useMemo(() => createClient(), []);
  const [stats, setStats] = useState(initialStats || { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 });
  const [activity, setActivity] = useState(initialActivity || []);
  const [liveScans, setLiveScans] = useState([]);
  const [newScanToast, setNewScanToast] = useState(null);

  useEffect(() => {
    if (!supabase || !userId) return;

    const scanChannel = supabase
      .channel(`scans-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        async (payload) => {
          const newScan = payload.new;
          try {
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

              setLiveScans(prev => {
                const updated = [newScan, ...prev].slice(0, 50);
                
                // --- AI Anomaly Detection ---
                const recentWindow = 60 * 1000; // 1 minute
                const recent = updated.filter(s => 
                  Date.now() - new Date(s.created_at).getTime() < recentWindow
                );

                const distinctCities = new Set(recent.map(s => s.city).filter(Boolean));
                
                if (recent.length > 5 || distinctCities.size > 2) {
                  // Trigger Persistent Alert
                  supabase.from("alerts").insert({
                    vehicle_id: newScan.vehicle_id,
                    alert_type: "sos",
                    message: recent.length > 5 
                      ? "⚠️ High-frequency scan anomaly detected (5+ scans/min)" 
                      : "⚠️ Suspicious geospatial activity detected",
                    city: newScan.city,
                    latitude: newScan.latitude,
                    longitude: newScan.longitude,
                    status: "open"
                  }).then(({ error }) => {
                    if (error) console.error("Failed to log AI alert:", error);
                  });
                }
                
                return updated;
              });

              const entry = {
                id: newScan.id,
                type: "scan",
                created_at: newScan.created_at,
                title: "New Scan Recorded",
                description: `${newScan.city || "Unknown location"} • Vehicle: ${vehicle.vehicle_number}`,
                isLive: true
              };

              setActivity(prev => [entry, ...prev].slice(0, 10));

              setNewScanToast({
                title: "Live Scan!",
                detail: `QR Scanned for ${vehicle.vehicle_number}`,
                location: newScan.city || "Unknown location"
              });

              setTimeout(() => setNewScanToast(null), 5000);
            }
          } catch (err) {
            console.error("Telemetry error:", err);
          }
        }
      )
      .subscribe();

    const alertChannel = supabase
      .channel("live-alerts")
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
                title: "EMERGENCY ALERT",
                description: `SOS Triggered for ${vehicle.vehicle_number}`,
                isLive: true
              };

              setActivity(prev => [entry, ...prev].slice(0, 10));
            }
          } catch (err) {
            console.error("Alert telemetry error:", err);
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
      {/* Premium Live Notifications */}
      <AnimatePresence>
        {newScanToast && (
          <motion.div
            key="telemetry-toast-guard"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400">
                  <Zap className="size-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{newScanToast.title}</h4>
                  <p className="text-sm text-slate-300">{newScanToast.detail}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
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
