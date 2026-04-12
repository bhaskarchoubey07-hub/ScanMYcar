import { createClient } from "@/lib/supabase/server";
import { formatDayLabel } from "@/lib/utils";

function aggregateDaily(items, key) {
  const map = new Map();

  items.forEach((item) => {
    const day = new Date(item[key]).toISOString().slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([day, total]) => ({
      day,
      label: formatDayLabel(day),
      total
    }));
}

export async function getUserDashboard(userId) {
  const supabase = await createClient();

  const { data: vehicles = [] } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const vehicleIds = vehicles.map((vehicle) => vehicle.id);

  const [{ data: scans = [] }, { data: alerts = [] }] = vehicleIds.length
    ? await Promise.all([
        supabase.from("scans").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false }),
        supabase.from("alerts").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false })
      ])
    : [{ data: [] }, { data: [] }];

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
      title: `${alert.alert_type.toUpperCase()} alert`,
      description: alert.message || "Emergency escalation triggered from public scan page."
    }))
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return {
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
  };
}

export async function getAdminDashboard() {
  const supabase = await createClient();
  const [{ data: users = [] }, { data: vehicles = [] }, { data: scans = [] }, { data: alerts = [] }] =
    await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("scans").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").order("created_at", { ascending: false })
    ]);

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
      detail: `${alert.alert_type.toUpperCase()} • ${alert.status}`
    }))
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  return {
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
  };
}

export async function getVehicleForEditor(id) {
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
  return data;
}

export async function getPublicVehicle(slug) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, vehicle_number, owner_name, owner_phone, emergency_contact, medical_info, qr_slug, is_public"
    )
    .eq("qr_slug", slug)
    .eq("is_public", true)
    .single();

  return data;
}
