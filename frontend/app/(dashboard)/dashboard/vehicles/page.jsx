"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageReveal } from "@/components/ui/motion-effects";
import { VehicleList } from "@/components/vehicles/vehicle-list";
import { createClient } from "@/lib/supabase/browser";

export default function VehiclesPage() {
  const supabase = createClient();
  const [vehicles, setVehicles] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setVehicles(data || []));
    }
  }, [supabase]);

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

      {!vehicles ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
        </div>
      ) : (
        <VehicleList vehicles={vehicles} />
      )}
    </PageReveal>
  );
}
