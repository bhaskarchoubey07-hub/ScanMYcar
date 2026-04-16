"use client";

import { VehicleForm } from "@/components/vehicles/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neon">Create Vehicle</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Register a vehicle and generate its QR identity</h1>
      </div>
      <VehicleForm />
    </div>
  );
}
