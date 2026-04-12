"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { createClient } from "@/lib/supabase/browser";
import { formatDate } from "@/lib/utils";

// Client-side version of the dashboard fetching logic
async function fetchUserDashboard(supabase, userId) {
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

  // Simple aggregation for chart
  const aggregateDaily = (items, key) => {
    const map = new Map();
    items.forEach((item) => {
      const day = new Date(item[key]).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([day, total]) => ({ day, label: day.slice(5), total }));
  };

  return {
    vehicles: vehicleRows,
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

export default function DashboardPage() {
  const supabase = createClient();
  const [data, setData] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      fetchUserDashboard(supabase, user.id).then(setData);
    }
  }, [supabase]);

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  return (
    <PageReveal className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neon">Fleet Overview</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Control room for your vehicle identity system</h1>
        </div>
        <Link href="/dashboard/vehicles/new" className="primary-button">
          Register vehicle
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vehicles" value={data.stats.totalVehicles} helper="Registered to your account" />
        <StatCard label="Total scans" value={data.stats.totalScans} helper="Captured from QR page visits" />
        <StatCard label="Open alerts" value={data.stats.activeAlerts} accent="glow" helper="SOS escalations" />
        <StatCard label="QR assets" value={data.stats.qrDownloads} helper="Ready for download" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ScanChart data={data.dailyScans} />

        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {data.activity.length ? (
              data.activity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{item.title}</p>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.type}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Activity will appear here as people scan your QR codes.</p>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold text-white">Your vehicles</h2>
          <p className="text-sm text-slate-400">Manage contact info, QR pages, and emergency readiness.</p>
        </div>
        <VehicleList vehicles={data.vehicles.slice(0, 4)} />
      </section>
    </PageReveal>
  );
}
