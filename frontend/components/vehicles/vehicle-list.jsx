"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Download, 
  Settings, 
  ExternalLink, 
  QrCode, 
  BarChart3, 
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { riseIn, staggerFast } from "@/lib/motion";

const BACKEND_URL = "http://localhost:5000/api";

export function VehicleList({ vehicles, admin = false }) {
  if (!vehicles || !vehicles.length) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={riseIn}
        className="glass-panel rounded-[2rem] p-12 text-center"
      >
        <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 opacity-50">
           <Smartphone className="text-slate-400" />
        </div>
        <p className="text-slate-400 font-medium">No registered assets detected in your fleet.</p>
        <p className="text-xs text-slate-600 mt-2 uppercase tracking-widest">Register a vehicle to generate its secure SOS identity.</p>
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
            y: -4,
            transition: { duration: 0.2 }
          }}
          className="glass-panel-premium hover-glow rounded-[2rem] p-6 lg:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                    Active Node
                 </div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{vehicle.vehicle_type || 'Asset'}</span>
              </div>
              
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{vehicle.vehicle_number}</h3>
                <p className="text-slate-400 font-medium mt-1">{vehicle.owner_name}</p>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{vehicle.total_scans || 0} Scans</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-sky-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">SOS Shield Enabled</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 self-end lg:self-start">
              <motion.a 
                href={`${BACKEND_URL}/vehicles/qr/download/${vehicle.qr_slug}`} 
                whileHover={{ scale: 1.04 }} 
                whileTap={{ scale: 0.98 }} 
                className="px-6 py-3 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Download size={14} />
                Download QR
              </motion.a>

              <Link href={`/v/${vehicle.qr_slug}`} target="_blank" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2">
                <ExternalLink size={14} />
                Live Hub
              </Link>
              
              <Link
                href={admin ? `/dashboard/admin/vehicles/${vehicle.id}` : `/dashboard/vehicles/${vehicle.id}/edit`}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
              >
                <Settings size={14} />
                Manage
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
