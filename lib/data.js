import { createClient } from "@/lib/supabase/server";
import { formatDayLabel } from "@/lib/utils";

function aggregateDaily(items = [], key = "created_at") {
  const map = new Map();
  const safeItems = Array.isArray(items) ? items : [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    map.set(day, 0);
  }

  safeItems.forEach((item) => {
    if (item && item[key]) {
      try {
        const day = new Date(item[key]).toISOString().slice(0, 10);
        if (map.has(day)) map.set(day, map.get(day) + 1);
      } catch (e) {}
    }
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, total]) => ({
      day,
      label: formatDayLabel(day),
      total
    }));
}

/**
 * Fetch Secure Dashboard Snapshot from Supabase
 */
export async function getUserDashboard() {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        vehicles: [], scans: [], alerts: [],
        stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0 },
        dailyScans: [], activity: []
      };
    }

    // Parallel fetch for better performance
    const [vehiclesRes, scansRes, alertsRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('scans').select('*, vehicles(vehicle_number)').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*, vehicles(vehicle_number)').eq('status', 'open').order('created_at', { ascending: false })
    ]);

    const vehicles = vehiclesRes.data || [];
    const scans = scansRes.data || [];
    const alerts = alertsRes.data || [];

    return {
      vehicles,
      scans,
      alerts,
      stats: {
        totalVehicles: vehicles.length,
        totalScans: scans.length,
        activeAlerts: alerts.length,
      },
      dailyScans: aggregateDaily(scans, "created_at"),
      activity: scans.slice(0, 10)
    };
  } catch (err) {
    console.error("Dashboard Retrieval Failure:", err.message);
    return {
      vehicles: [], scans: [], alerts: [],
      stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0 },
      dailyScans: [], activity: []
    };
  }
}

/**
 * Public Identity Discovery (Direct Supabase)
 */
export async function getPublicVehicle(slug) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, users(full_name, phone)')
      .eq('qr_slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Public Identity Retrieval Error:", e);
    return null;
  }
}
