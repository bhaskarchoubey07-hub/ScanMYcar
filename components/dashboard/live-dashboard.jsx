"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const LiveDashboardContext = createContext(null);

export function useLiveDashboard() {
  const context = useContext(LiveDashboardContext);
  if (!context) {
    return {
      stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0 },
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
  const [stats, setStats] = useState(initialStats || { totalVehicles: 0, totalScans: 0, activeAlerts: 0 });
  const [activity, setActivity] = useState(initialActivity || []);
  const [liveScans, setLiveScans] = useState([]);
  const [newScanToast, setNewScanToast] = useState(null);

  // AI Anomaly Detection Logic
  const checkForAnomaly = useCallback(async (scan, vehicleNumber) => {
    const recentScans = [scan, ...liveScans].filter(s => 
      s.vehicle_id === scan.vehicle_id && 
      (new Date() - new Date(s.created_at)) < 60000 // Last 1 minute
    );

    if (recentScans.length >= 3) {
      toast.error(`Suspicious activity detected for ${vehicleNumber}! Multiple scans in 60s.`, {
        duration: 6000,
        icon: <ShieldAlert className="text-red-500" />
      });

      // Auto-log alert in Supabase
      await supabase.from('alerts').insert([{
        vehicle_id: scan.vehicle_id,
        alert_type: 'sos',
        message: `AI Detection: Rapid sequence of ${recentScans.length} scans detected in 60 seconds. Potential unauthorized access attempt.`,
        status: 'open',
        latitude: scan.latitude,
        longitude: scan.longitude
      }]);
    }
  }, [liveScans, supabase]);

  useEffect(() => {
    if (!supabase || !userId) return;

    const scanChannel = supabase
      .channel('schema-db-changes')
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scans" },
        async (payload) => {
          const newScan = payload.new;
          
          const { data: vehicle } = await supabase
            .from("vehicles")
            .select("user_id, vehicle_number")
            .eq("id", newScan.vehicle_id)
            .single();

          if (vehicle && vehicle.user_id === userId) {
            setStats(prev => ({
              ...prev,
              totalScans: (prev.totalScans || 0) + 1
            }));

            setLiveScans(prev => [newScan, ...prev].slice(0, 50));
            
            const entry = {
              id: newScan.id,
              type: "scan",
              created_at: newScan.created_at,
              title: "Real-time Scan",
              description: `Vehicle: ${vehicle.vehicle_number}`,
              isLive: true
            };

            setActivity(prev => [entry, ...prev].slice(0, 10));
            setNewScanToast({
              title: "Inbound Scan",
              detail: `Identity check for ${vehicle.vehicle_number}`,
              location: newScan.city || "Remote Location"
            });
            setTimeout(() => setNewScanToast(null), 5000);

            // Trigger AI Check
            checkForAnomaly(newScan, vehicle.vehicle_number);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        async (payload) => {
          const newAlert = payload.new;
          const { data: vehicle } = await supabase
            .from("vehicles")
            .select("user_id")
            .eq("id", newAlert.vehicle_id)
            .single();

          if (vehicle && vehicle.user_id === userId) {
            setStats(prev => ({
              ...prev,
              activeAlerts: (prev.activeAlerts || 0) + 1
            }));

            setActivity(prev => [{
              id: newAlert.id,
              type: "alert",
              created_at: newAlert.created_at,
              title: `SOS Alert: ${newAlert.alert_type?.toUpperCase()}`,
              description: newAlert.message,
              isLive: true
            }, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scanChannel);
    };
  }, [supabase, userId, checkForAnomaly]);

  return (
    <LiveDashboardContext.Provider value={{ stats, activity, liveScans }}>
      <AnimatePresence>
        {newScanToast && (
          <motion.div
            key="telemetry-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm p-1"
          >
            <div className="rounded-[2rem] border border-emerald-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-400">
                <Zap className="size-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase tracking-tight text-xs">{newScanToast.title}</h4>
                <p className="text-sm text-slate-300 font-medium">{newScanToast.detail}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <MapPin className="size-3" />
                  {newScanToast.location}
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
