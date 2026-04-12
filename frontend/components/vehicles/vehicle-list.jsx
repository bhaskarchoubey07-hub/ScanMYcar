import Link from "next/link";

export function VehicleList({ vehicles, admin = false }) {
  if (!vehicles.length) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-sm text-slate-300">
        No vehicles yet. Add one to start generating dynamic QR pages.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="glass-panel rounded-3xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neon">{vehicle.vehicle_number}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{vehicle.owner_name}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {vehicle.owner_phone} • Emergency: {vehicle.emergency_contact}
              </p>
              <p className="mt-2 text-sm text-slate-500">Scans tracked: {vehicle.total_scans || 0}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={`/api/qr/${vehicle.qr_slug}`} className="primary-button">
                Download QR
              </a>
              <Link href={`/v/${vehicle.qr_slug}`} className="secondary-button">
                Public page
              </Link>
              <Link
                href={admin ? `/dashboard/admin/vehicles/${vehicle.id}` : `/dashboard/vehicles/${vehicle.id}/edit`}
                className="secondary-button"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
