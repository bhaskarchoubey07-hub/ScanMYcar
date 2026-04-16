"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { createClient } from "@/lib/supabase/browser";

export default function EditVehiclePage() {
  const { id } = useParams();
  const supabase = createClient();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    
    supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data && (data.user_id === savedUser.id || savedUser.role === "admin")) {
          setVehicle(data);
        }
        setLoading(false);
      });
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  if (!vehicle) {
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
