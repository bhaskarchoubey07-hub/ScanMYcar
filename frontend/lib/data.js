import { createClient } from "@/lib/supabase/server";
import { formatDayLabel } from "@/lib/utils";

function aggregateDaily(items = [], key = "created_at") {
  const map = new Map();
  const safeItems = Array.isArray(items) ? items : [];

  // Initialize last 7 days with 0 to ensure chart stability
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
        if (map.has(day)) {
          map.set(day, map.get(day) + 1);
        }
      } catch (e) {
        console.error("Invalid date in aggregator:", item[key]);
      }
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

// Safety helper to ensure data is strictly serializable for Next.js Server-to-Client boundary
function serialize(data) {
  return JSON.parse(JSON.stringify(data));
}

export async function getUserDashboard(userId) {
  try {
    const supabase = await createClient();

    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
    }
    const vehicles = vehiclesData || [];

    const vehicleIds = vehicles.map((v) => v.id);

    let scans = [];
    let alerts = [];

    if (vehicleIds.length > 0) {
      const [scansResult, alertsResult] = await Promise.all([
        supabase.from("scans").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false }),
        supabase.from("alerts").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false })
      ]);
      
      if (scansResult.error) console.error("Error fetching scans:", scansResult.error);
      if (alertsResult.error) console.error("Error fetching alerts:", alertsResult.error);
      
      scans = scansResult.data || [];
      alerts = alertsResult.data || [];
    }

    const scansByVehicle = scans.reduce((accumulator, scan) => {
      accumulator[scan.vehicle_id] = (accumulator[scan.vehicle_id] || 0) + 1;
      return accumulator;
    }, {});

    const vehicleRows = vehicles.map((vehicle) => ({
      ...vehicle,
      total_scans: scansByVehicle[vehicle.id] || 0
    }));

    const activity = [
      ...scans.map((scan) => ({
        id: scan.id,
        type: "scan",
        created_at: scan.created_at,
        title: "QR scan recorded",
        description: `${scan.city || "Unknown location"}${scan.latitude ? ` • ${scan.latitude}, ${scan.longitude}` : ""}`
      })),
      ...alerts.map((alert) => ({
        id: alert.id,
        type: "alert",
        created_at: alert.created_at,
        title: `${alert.alert_type?.toUpperCase() || "NEW"} alert`,
        description: alert.message || "Emergency escalation triggered from public scan page."
      }))
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    return serialize({
      vehicles: vehicleRows,
      scans,
      alerts,
      stats: {
        totalVehicles: vehicles.length,
        totalScans: scans.length,
        activeAlerts: alerts.filter((alert) => alert.status === "open").length,
        qrDownloads: vehicles.filter((vehicle) => vehicle.qr_slug).length
      },
      dailyScans: aggregateDaily(scans, "created_at"),
      activity
    });
  } catch (err) {
    console.error("Critical error in getUserDashboard:", err);
    return serialize({
      vehicles: [],
      scans: [],
      alerts: [],
      stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 },
      dailyScans: [],
      activity: []
    });
  }
}

export async function getAdminDashboard() {
  try {
    const supabase = await createClient();
    const [usersResult, vehiclesResult, scansResult, alertsResult] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("scans").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").order("created_at", { ascending: false })
    ]);

    if (usersResult.error) console.error("Admin user fetch error:", usersResult.error);
    if (vehiclesResult.error) console.error("Admin vehicle fetch error:", vehiclesResult.error);
    if (scansResult.error) console.error("Admin scans fetch error:", scansResult.error);
    if (alertsResult.error) console.error("Admin alerts fetch error:", alertsResult.error);

    const users = usersResult.data || [];
    const vehicles = vehiclesResult.data || [];
    const scans = scansResult.data || [];
    const alerts = alertsResult.data || [];

    const recentActivity = [
      ...scans.slice(0, 8).map((scan) => ({
        id: scan.id,
        kind: "Scan",
        created_at: scan.created_at,
        detail: scan.city || "Public scan logged"
      })),
      ...alerts.slice(0, 8).map((alert) => ({
        id: alert.id,
        kind: "Alert",
        created_at: alert.created_at,
        detail: `${alert.alert_type?.toUpperCase() || "NEW"} • ${alert.status || 'open'}`
      }))
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 12);

    return serialize({
      users,
      vehicles,
      scans,
      alerts,
      dailyScans: aggregateDaily(scans, "created_at"),
      recentActivity,
      stats: {
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        totalScans: scans.length,
        emergencyAlerts: alerts.length
      }
    });
  } catch (err) {
    console.error("Critical error in getAdminDashboard:", err);
    return serialize({
      users: [], vehicles: [], scans: [], alerts: [],
      dailyScans: [], recentActivity: [],
      stats: { totalUsers: 0, totalVehicles: 0, totalScans: 0, emergencyAlerts: 0 }
    });
  }
}

export async function getVehicleForEditor(id) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).single();
    if (error) {
       console.error("Error fetching vehicle for editor:", error);
       return null;
    }
    return data;
  } catch (e) {
    console.error("Exception in getVehicleForEditor:", e);
    return null;
  }
}

export async function getPublicVehicle(slug) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        "id, vehicle_number, owner_name, owner_phone, emergency_contact, medical_info, qr_slug, is_public"
      )
      .eq("qr_slug", slug)
      .eq("is_public", true)
      .single();

    if (error) {
      console.error("Error fetching public vehicle:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Exception in getPublicVehicle:", e);
    return null;
  }
}
