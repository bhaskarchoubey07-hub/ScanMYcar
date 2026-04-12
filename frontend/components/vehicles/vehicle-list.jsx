"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { riseIn, staggerFast } from "@/lib/motion";

export function VehicleList({ vehicles, admin = false }) {
  if (!vehicles.length) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={riseIn}
        className="glass-panel rounded-3xl p-8 text-sm text-slate-300"
      >
        No vehicles yet. Add one to start generating dynamic QR pages.
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerFast} className="grid gap-5">
      {vehicles.map((vehicle) => (
        <motion.div
          key={vehicle.id}
          variants={riseIn}
          whileHover={{
            scale: 1.015,
            y: -3,
            boxShadow: "0 0 0 1px rgba(56, 189, 248, 0.16), 0 20px 52px rgba(56, 189, 248, 0.14)"
          }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="glass-panel hover-neon rounded-3xl p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neon">{vehicle.vehicle_number}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{vehicle.owner_name}</h3>
              <p className="mt-2 text-sm text-slate-400">
                {vehicle.owner_phone} • Emergency: {vehicle.emergency_contact}
              </p>
              <p className="mt-2 text-sm text-slate-500">Scans tracked: {vehicle.total_scans || 0}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.a href={`/api/qr/${vehicle.qr_slug}`} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="primary-button">
                Download QR
              </motion.a>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.985 }}>
                <Link href={`/v/${vehicle.qr_slug}`} className="secondary-button">
                  Public page
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.985 }}>
                <Link
                  href={admin ? `/dashboard/admin/vehicles/${vehicle.id}` : `/dashboard/vehicles/${vehicle.id}/edit`}
                  className="secondary-button"
                >
                  Edit
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
