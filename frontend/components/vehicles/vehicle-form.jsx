"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteVehicleAction, upsertVehicleAction } from "@/lib/actions";
import { fieldReveal, pageReveal, pulseGlow, staggerContainer } from "@/lib/motion";

const focusMotion = {
  scale: 1.02,
  boxShadow: "0 0 0 5px rgba(56, 189, 248, 0.16)"
};

export function VehicleForm({ vehicle, scope = "owner" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    startTransition(async () => {
      const result = await upsertVehicleAction(formData, scope, savedUser.id);
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

    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    startTransition(async () => {
      const result = await deleteVehicleAction(vehicle.id, savedUser.id);
      setMessage(result.message);
      if (result.success) {
        router.push(scope === "admin" ? "/dashboard/admin" : "/dashboard/vehicles");
        router.refresh();
      }
    });
  };

  return (
    <motion.form onSubmit={submit} initial="hidden" animate="visible" variants={pageReveal} className="glass-panel floating-glow rounded-[2rem] p-6">
      {vehicle?.id && <input type="hidden" name="id" defaultValue={vehicle.id} />}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-5 md:grid-cols-2">
        <motion.label variants={fieldReveal} className="field">
          <span>Vehicle number</span>
          <motion.input
            whileFocus={focusMotion}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            name="vehicle_number"
            defaultValue={vehicle?.vehicle_number}
            placeholder="KA01AB1234"
            required
          />
        </motion.label>
        <motion.label variants={fieldReveal} className="field">
          <span>Owner name</span>
          <motion.input
            whileFocus={focusMotion}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            name="owner_name"
            defaultValue={vehicle?.owner_name}
            placeholder="Aarav Sharma"
            required
          />
        </motion.label>
        <motion.label variants={fieldReveal} className="field">
          <span>Owner phone</span>
          <motion.input
            whileFocus={focusMotion}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            name="owner_phone"
            defaultValue={vehicle?.owner_phone}
            placeholder="+91 9876543210"
            required
          />
        </motion.label>
        <motion.label variants={fieldReveal} className="field">
          <span>Emergency contact</span>
          <motion.input
            whileFocus={focusMotion}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            name="emergency_contact"
            defaultValue={vehicle?.emergency_contact}
            placeholder="+91 9988776655"
            required
          />
        </motion.label>
      </motion.div>

      <motion.label variants={fieldReveal} initial="hidden" animate="visible" className="field mt-5">
        <span>Medical information</span>
        <motion.textarea
          whileFocus={focusMotion}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          name="medical_info"
          defaultValue={vehicle?.medical_info || ""}
          placeholder="Optional allergy, blood group, or critical medical notes."
          rows={4}
        />
      </motion.label>

      <motion.label
        variants={fieldReveal}
        initial="hidden"
        animate="visible"
        className="mt-5 flex items-center gap-3 text-sm text-slate-300"
      >
        <input type="checkbox" name="is_public" defaultChecked={vehicle?.is_public ?? true} className="size-4 rounded" />
        Make this vehicle page publicly accessible when the QR is scanned.
      </motion.label>

      {message && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-sm text-slate-300">
          {message}
        </motion.p>
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 flex flex-wrap gap-3">
        <motion.button
          type="submit"
          disabled={pending}
          variants={fieldReveal}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="primary-button"
        >
          <motion.span animate="rest" variants={pulseGlow}>
            {pending ? "Saving..." : vehicle ? "Update vehicle" : "Create vehicle"}
          </motion.span>
        </motion.button>
        <motion.div variants={fieldReveal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.985 }}>
          <Link href={scope === "admin" ? "/dashboard/admin" : "/dashboard/vehicles"} className="secondary-button">
            Cancel
          </Link>
        </motion.div>
        {vehicle && (
          <motion.button
            type="button"
            onClick={remove}
            disabled={pending}
            variants={fieldReveal}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="danger-button"
          >
            Delete
          </motion.button>
        )}
      </motion.div>
    </motion.form>
  );
}
