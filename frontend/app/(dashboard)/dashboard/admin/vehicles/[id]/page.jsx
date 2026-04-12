import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { requireAdmin } from "@/lib/auth";
import { getVehicleForEditor } from "@/lib/data";

export default async function AdminVehicleEditorPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const vehicle = await getVehicleForEditor(id);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-glow">Admin Editor</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Update a platform vehicle entry</h1>
      </div>
      <VehicleForm vehicle={vehicle} scope="admin" />
    </div>
  );
}
