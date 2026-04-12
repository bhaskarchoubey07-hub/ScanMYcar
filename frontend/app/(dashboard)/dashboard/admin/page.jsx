"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { createClient } from "@/lib/supabase/browser";
import { formatDate } from "@/lib/utils";

// Client-side version of the admin dashboard fetching logic
async function fetchAdminDashboard(supabase) {
  const [{ data: users = [] }, { data: vehicles = [] }, { data: scans = [] }, { data: alerts = [] }] =
    await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("scans").select("*").order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").order("created_at", { ascending: false })
    ]);

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

export default function AdminPage() {
  const supabase = createClient();
  const [adminData, setAdminData] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "admin") {
        setIsAuthorized(true);
        fetchAdminDashboard(supabase).then(setAdminData);
      }
    }
  }, [supabase]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-white">You do not have permission to view this page.</p>
        <Link href="/dashboard" className="secondary-button">Return to Dashboard</Link>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  return (
    <PageReveal className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-glow">Admin Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Analytics, fleet operations, and emergency oversight</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={adminData.stats.totalUsers} helper="Authenticated account holders" />
        <StatCard label="Vehicles" value={adminData.stats.totalVehicles} helper="Registered across the platform" />
        <StatCard label="Scans" value={adminData.stats.totalScans} accent="glow" helper="Public QR interactions" />
        <StatCard label="Alerts" value={adminData.stats.emergencyAlerts} helper="Emergency escalation records" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ScanChart data={adminData.dailyScans} />

        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {adminData.recentActivity.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-white">{item.kind}</p>
                  <span className="text-xs uppercase tracking-[0.35em] text-slate-500">{formatDate(item.created_at)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Editable vehicle entries</h2>
            <p className="text-sm text-slate-400">Admin can inspect, correct, and manage public-facing vehicle pages.</p>
          </div>
          <Link href="/api/vehicles/export" className="secondary-button">
            Export CSV
          </Link>
        </div>
        <VehicleList vehicles={adminData.vehicles.slice(0, 8)} admin />
      </section>
    </PageReveal>
  );
}
