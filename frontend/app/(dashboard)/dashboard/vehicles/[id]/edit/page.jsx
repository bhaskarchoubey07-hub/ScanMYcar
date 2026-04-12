import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { requireUser } from "@/lib/auth";
import { getVehicleForEditor } from "@/lib/data";

export default async function EditVehiclePage({ params }) {
  const { user, profile } = await requireUser();
  const { id } = await params;
  const vehicle = await getVehicleForEditor(id);

  if (!vehicle || (vehicle.user_id !== user.id && profile?.role !== "admin")) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neon">Edit Vehicle</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Update QR page and emergency details</h1>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
