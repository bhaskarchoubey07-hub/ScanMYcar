import { notFound } from "next/navigation";
import { PublicActions } from "@/components/public/public-actions";
import { getPublicVehicle } from "@/lib/data";
import { ShieldAlert, User, Phone, Info, MapPin } from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);

  return {
    title: vehicle ? `${vehicle.vehicle_number} • Secure Identity` : "Vehicle Identity",
    description: "Institutional-grade emergency outreach and vehicle verification."
  };
}

export default async function PublicVehiclePage({ params }) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 py-12 lg:p-12 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="w-full max-w-2xl relative z-10">
        {/* Identity Header */}
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20 text-emerald-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-3 ml-[0.5em]">Verified Identity</p>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white uppercase italic">
            {vehicle.vehicle_number}
          </h1>
        </div>

        {/* Secure Info Card */}
        <div className="glass-panel-premium rounded-[3rem] border border-white/10 p-8 lg:p-12 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldAlert size={120} />
          </div>

          <div className="space-y-10">
            <section className="flex gap-6 items-start">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <User className="text-slate-400 w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Asset Registered to</p>
                <p className="text-2xl font-semibold text-white">{vehicle.owner_name}</p>
              </div>
            </section>

            <section className="flex gap-6 items-start">
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <Phone className="text-slate-400 w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Emergency Family Contact</p>
                <p className="text-2xl font-semibold text-white">{vehicle.emergency_contact}</p>
              </div>
            </section>

            {vehicle.medical_info && (
              <section className="flex gap-6 items-start">
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 flex-shrink-0">
                  <Info className="text-red-400 w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-red-500">Critical Medical Records</p>
                  <p className="text-lg font-medium text-slate-300 leading-relaxed">{vehicle.medical_info}</p>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Interactive Actions (SOS & Calls) */}
        <div className="w-full">
          <PublicActions vehicle={vehicle} />
        </div>

        {/* Trust Footer */}
        <footer className="mt-16 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <ShieldAlert size={14} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secured by ScanMyCar Protocol v2.4</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
