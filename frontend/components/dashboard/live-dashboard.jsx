"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Bell, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function LiveDashboard({ 
  initialStats, 
  initialActivity, 
  userId, 
  children 
}) {
  const supabase = createClient();
  const [stats, setStats] = useState(initialStats);
  const [activity, setActivity] = useState(initialActivity);
  const [newScanToast, setNewScanToast] = useState(null);

  useEffect(() => {
    // 1. Subscribe to Realtime Scans
    // We listen to all scans, but only act if it belongs to one of the user's vehicles.
    // In a real production app, we would use private channels or filtered payloads.
    const scanChannel = supabase
      .channel("live-scans")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        async (payload) => {
          const newScan = payload.new;
          
          // Verify if this scan belongs to the user's vehicles
          const { data: vehicle } = await supabase
            .from("vehicles")
            .select("user_id, vehicle_number")
            .eq("id", newScan.vehicle_id)
            .single();

          if (vehicle && vehicle.user_id === userId) {
            // Update Stats
            setStats(prev => ({
              ...prev,
              totalScans: prev.totalScans + 1
            }));

            // Update Activity Feed
            const entry = {
              id: newScan.id,
              type: "scan",
              created_at: newScan.created_at,
              title: "New Scan Recorded",
              description: `${newScan.city || "Unknown location"} • Vehicle: ${vehicle.vehicle_number}`,
              isLive: true
            };

            setActivity(prev => [entry, ...prev].slice(0, 10));

            // Trigger Premium Toast
            setNewScanToast({
              title: "Live Scan!",
              detail: `QR Scanned for ${vehicle.vehicle_number}`,
              location: newScan.city || "Unknown location"
            });

            setTimeout(() => setNewScanToast(null), 5000);
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Realtime Alerts
    const alertChannel = supabase
      .channel("live-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        async (payload) => {
          const newAlert = payload.new;

          const { data: vehicle } = await supabase
            .from("vehicles")
            .select("user_id, vehicle_number")
            .eq("id", newAlert.vehicle_id)
            .single();

          if (vehicle && vehicle.user_id === userId) {
            setStats(prev => ({
              ...prev,
              activeAlerts: prev.activeAlerts + 1
            }));

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scanChannel);
      supabase.removeChannel(alertChannel);
    };
  }, [supabase, userId]);

  return (
    <>
      {/* Premium Live Notifications */}
      <AnimatePresence>
        {newScanToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400">
                  <Activity className="size-6 animate-pulse" />
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

      {/* Inject Live Data into Children */}
      {/* We use a simple pattern of passing props to children or providing a context.
          For the current dashboard structure, we'll wrap the charts and stats in the Page with these live values. */}
      {children({ stats, activity })}
    </>
  );
}
