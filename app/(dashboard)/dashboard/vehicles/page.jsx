import Link from "next/link";
import { PageReveal } from "@/components/ui/motion-effects";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";

export default async function VehiclesPage() {
  const { user } = await requireUser();
  const dashboard = await getUserDashboard(user.id);

  return (
    <PageReveal className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neon">Vehicle Management</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Vehicle records and QR assets</h1>
        </div>
        <Link href="/dashboard/vehicles/new" className="primary-button">
          Add vehicle
        </Link>
      </div>

      <VehicleList vehicles={dashboard.vehicles} />
    </PageReveal>
  );
}
