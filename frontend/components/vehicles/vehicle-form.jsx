"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteVehicleAction, upsertVehicleAction } from "@/lib/actions";

export function VehicleForm({ vehicle, scope = "owner" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await upsertVehicleAction(formData, scope);
      setMessage(result.message);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!vehicle?.id || !window.confirm("Delete this vehicle and all associated scans and alerts?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteVehicleAction(vehicle.id);
      setMessage(result.message);
      if (result.success) {
        router.push(scope === "admin" ? "/dashboard/admin" : "/dashboard/vehicles");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={submit} className="glass-panel rounded-[2rem] p-6">
      {vehicle?.id && <input type="hidden" name="id" defaultValue={vehicle.id} />}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="field">
          <span>Vehicle number</span>
          <input name="vehicle_number" defaultValue={vehicle?.vehicle_number} placeholder="KA01AB1234" required />
        </label>
        <label className="field">
          <span>Owner name</span>
          <input name="owner_name" defaultValue={vehicle?.owner_name} placeholder="Aarav Sharma" required />
        </label>
        <label className="field">
          <span>Owner phone</span>
          <input name="owner_phone" defaultValue={vehicle?.owner_phone} placeholder="+91 9876543210" required />
        </label>
        <label className="field">
          <span>Emergency contact</span>
          <input
            name="emergency_contact"
            defaultValue={vehicle?.emergency_contact}
            placeholder="+91 9988776655"
            required
          />
        </label>
      </div>

      <label className="field mt-5">
        <span>Medical information</span>
        <textarea
          name="medical_info"
          defaultValue={vehicle?.medical_info || ""}
          placeholder="Optional allergy, blood group, or critical medical notes."
          rows={4}
        />
      </label>

      <label className="mt-5 flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" name="is_public" defaultChecked={vehicle?.is_public ?? true} className="size-4 rounded" />
        Make this vehicle page publicly accessible when the QR is scanned.
      </label>

      {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className="primary-button">
          {pending ? "Saving..." : vehicle ? "Update vehicle" : "Create vehicle"}
        </button>
        <Link href={scope === "admin" ? "/dashboard/admin" : "/dashboard/vehicles"} className="secondary-button">
          Cancel
        </Link>
        {vehicle && (
          <button type="button" onClick={remove} disabled={pending} className="danger-button">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
