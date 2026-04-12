import { notFound } from "next/navigation";
import { PublicActions } from "@/components/public/public-actions";
import { getPublicVehicle } from "@/lib/data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);

  return {
    title: vehicle ? `${vehicle.vehicle_number} • Emergency Vehicle Identity` : "Vehicle Identity",
    description: "Public scan page for emergency contact and rapid owner outreach."
  };
}

export default async function PublicVehiclePage({ params }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
      <div className="glass-panel w-full rounded-[2rem] p-7 shadow-glass sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-neon">Public vehicle identity</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">{vehicle.vehicle_number}</h1>
        <p className="mt-3 text-lg text-slate-300">Owner: {vehicle.owner_name}</p>
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white">Emergency contact</p>
          <p className="mt-2 text-slate-300">{vehicle.emergency_contact}</p>
          {vehicle.medical_info && (
            <>
              <p className="mt-4 text-sm font-medium text-white">Medical information</p>
              <p className="mt-2 text-slate-300">{vehicle.medical_info}</p>
            </>
          )}
        </div>

        <div className="mt-8">
          <PublicActions vehicle={vehicle} />
        </div>
      </div>
    </main>
  );
}
