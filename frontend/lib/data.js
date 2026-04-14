import axios from "axios";
import { formatDayLabel } from "@/lib/utils";
import { cookies } from "next/headers";

const BACKEND_URL = "http://localhost:5000/api";

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
 * Fetch Secure Dashboard Snapshot
 */
export async function getUserDashboard(userId) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    const response = await axios.get(`${BACKEND_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;

    return {
      vehicles: data.vehicles || [],
      scans: data.scans || [],
      alerts: data.alerts || [],
      stats: data.stats || { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 },
      dailyScans: aggregateDaily(data.scans, "created_at"),
      activity: data.activity || []
    };
  } catch (err) {
    console.error("Institutional Telemetry Failure:", err.message);
    return {
      vehicles: [], scans: [], alerts: [],
      stats: { totalVehicles: 0, totalScans: 0, activeAlerts: 0, qrDownloads: 0 },
      dailyScans: [], activity: []
    };
  }
}

/**
 * Public Identity Discovery (Secure Slug Discovery)
 */
export async function getPublicVehicle(slug) {
  try {
    // CORRECTED PATH: /api/public/v/:slug
    const response = await fetch(`${BACKEND_URL}/public/v/${slug}`, { next: { revalidate: 60 } });
    if (!response.ok) return null;
    return response.json();
  } catch (e) {
    console.error("Public Identity Retrieval Error:", e);
    return null;
  }
}
