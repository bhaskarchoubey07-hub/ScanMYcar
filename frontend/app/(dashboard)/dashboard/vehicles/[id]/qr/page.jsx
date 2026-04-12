import { notFound } from "next/navigation";
import { PremiumQrCard } from "@/components/vehicles/premium-qr-card";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageReveal } from "@/components/ui/motion-effects";

export default async function VehicleQrPage({ params }) {
  const { user } = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (!vehicle || vehicle.user_id !== user.id) {
    notFound();
  }

  return (
    <PageReveal className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neon">Advanced QR Assets</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Ultra-Premium Identity Card</h1>
        <p className="mt-2 text-slate-400">
          This is a professional-grade secure vehicle identity card. Download or print it to keep with your vehicle.
        </p>
      </div>

      <PremiumQrCard vehicle={vehicle} />
    </PageReveal>
  );
}
