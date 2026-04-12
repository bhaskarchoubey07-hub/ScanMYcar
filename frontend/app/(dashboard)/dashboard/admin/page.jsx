import Link from "next/link";
import { PageReveal } from "@/components/ui/motion-effects";
import { ScanChart } from "@/components/dashboard/scan-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const admin = await getAdminDashboard();

  return (
    <PageReveal className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-glow">Admin Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Analytics, fleet operations, and emergency oversight</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={admin.stats.totalUsers} helper="Authenticated account holders" />
        <StatCard label="Vehicles" value={admin.stats.totalVehicles} helper="Registered across the platform" />
        <StatCard label="Scans" value={admin.stats.totalScans} accent="glow" helper="Public QR interactions" />
        <StatCard label="Alerts" value={admin.stats.emergencyAlerts} helper="Emergency escalation records" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <ScanChart data={admin.dailyScans} />

        <div className="glass-panel rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <div className="mt-5 space-y-4">
            {admin.recentActivity.map((item) => (
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
        <VehicleList vehicles={admin.vehicles.slice(0, 8)} admin />
      </section>
    </PageReveal>
  );
}
