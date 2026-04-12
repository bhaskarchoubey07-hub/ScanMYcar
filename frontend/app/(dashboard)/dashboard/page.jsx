import Link from "next/link";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { user } = await requireUser();
  const dashboard = await getUserDashboard(user.id);

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
        <StatCard label="Vehicles" value={dashboard.stats.totalVehicles} helper="Registered to your account" />
        <StatCard label="Total scans" value={dashboard.stats.totalScans} helper="Captured from QR page visits" />
        <StatCard label="Open alerts" value={dashboard.stats.activeAlerts} accent="glow" helper="SOS escalations" />
        <StatCard label="QR assets" value={dashboard.stats.qrDownloads} helper="Ready for download" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ScanChart data={dashboard.dailyScans} />

        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {dashboard.activity.length ? (
              dashboard.activity.map((item) => (
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
        <VehicleList vehicles={dashboard.vehicles.slice(0, 4)} />
      </section>
    </PageReveal>
  );
}
