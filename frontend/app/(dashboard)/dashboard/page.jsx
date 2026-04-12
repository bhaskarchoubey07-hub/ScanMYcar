import Link from "next/link";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { LiveDashboard } from "@/components/dashboard/live-dashboard";
import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { user } = await requireUser();
  const dashboard = await getUserDashboard(user.id);

  return (
    <LiveDashboard
      userId={user.id}
      initialStats={dashboard.stats}
      initialActivity={dashboard.activity}
    >
      {({ stats, activity }) => (
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
            <StatCard label="Vehicles" value={stats.totalVehicles} helper="Registered to your account" />
            <StatCard label="Total scans" value={stats.totalScans} helper="Captured from QR page visits" />
            <StatCard label="Open alerts" value={stats.activeAlerts} accent="glow" helper="SOS escalations" />
            <StatCard label="QR assets" value={stats.qrDownloads} helper="Ready for download" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <ScanChart data={dashboard.dailyScans} />

            <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feed
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
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
                        <div className="absolute -left-1 -top-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[8px] font-bold text-slate-950">
                          NEW
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3">
                        <p className={`font-medium ${item.isLive ? "text-emerald-400" : "text-white"}`}>{item.title}</p>
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
            <VehicleList vehicles={dashboard.vehicles.slice(0, 4)} />
          </section>
        </PageReveal>
      )}
    </LiveDashboard>
  );
}
