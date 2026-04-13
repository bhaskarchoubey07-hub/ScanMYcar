"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { SecurityMonitor } from "@/components/dashboard/security-monitor";
import { useLiveDashboard } from "@/components/dashboard/live-dashboard";
import { formatDate } from "@/lib/utils";

const ScanHeatmap = dynamic(
  () => import("@/components/dashboard/scan-heatmap"),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-900/50 animate-pulse rounded-3xl" /> }
);

export function DashboardHub({ initialVehicles, initialDailyScans, initialScans }) {
  const { stats, activity, liveScans } = useLiveDashboard();

  return (
    <PageReveal className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon">Global Fleet Intelligence</p>
          <h1 className="mt-3 text-4xl font-semibold text-white tracking-tight">Vehicle Control Room</h1>
        </div>
        <Link href="/dashboard/vehicles/new" className="primary-button bg-glow text-slate-950 font-bold border-none shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          Register New Vehicle
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Fleet" value={stats.totalVehicles} helper="Active vehicle IDs" />
        <StatCard label="Global Interactions" value={stats.totalScans} helper="Total decoded QR scans" />
        <StatCard label="Critical Alerts" value={stats.activeAlerts} accent="glow" helper="Open SOS escalations" />
        <StatCard label="QR Inventory" value={stats.qrDownloads} helper="Assets ready for print" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <ScanHeatmap scans={liveScans.length ? liveScans : initialScans} />
        <SecurityMonitor scans={liveScans.length ? liveScans : initialScans} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ScanChart data={initialDailyScans} />

        <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
          <div className="absolute top-0 right-0 p-6">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream
            </div>
          </div>
          
          <h2 className="text-lg font-semibold text-white">Security Event Log</h2>
          <div className="mt-8 space-y-4">
            {activity.length ? (
              activity.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className={`relative rounded-3xl border p-4 transition-all ${
                    item.isLive 
                      ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  {item.isLive && (
                    <div className="absolute -right-2 -top-2 rounded-full bg-neon px-2 py-0.5 text-[8px] font-black text-slate-950">
                      LIVE
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <p className={`font-semibold ${item.isLive ? "text-neon" : "text-white"}`}>{item.title}</p>
                    <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">{item.type}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                  <p className="mt-2 text-[10px] font-medium text-slate-500 uppercase tracking-widest">{formatDate(item.created_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-10 text-center italic">Waiting for incoming telemetry...</p>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Asset Inventory</h2>
          <p className="text-sm text-slate-500">Manage security settings and emergency outreach profiles.</p>
        </div>
        <VehicleList vehicles={initialVehicles.slice(0, 4)} />
      </section>
    </PageReveal>
  );
}
