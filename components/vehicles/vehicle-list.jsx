"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Settings, 
  ExternalLink, 
  BarChart3, 
  ShieldCheck,
  Smartphone,
  Eye
} from "lucide-react";
import { riseIn, staggerFast } from "@/lib/motion";

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
        <p className="text-slate-400 font-medium font-bold">No assets found in your identity fleet.</p>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.2em]">Register a vehicle to generate its encrypted SOS identity.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerFast} className="grid gap-5">
      {vehicles.map((vehicle) => (
        <motion.div
          key={vehicle.id}
          variants={riseIn}
          whileHover={{ y: -4 }}
          className="glass-panel hover:border-emerald-500/30 rounded-[2.5rem] p-6 lg:p-10 transition-all duration-300"
        >
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Identity
                 </div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{vehicle.vehicle_type || 'Asset'}</span>
              </div>
              
              <div>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">{vehicle.vehicle_number}</h3>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[11px]">{vehicle.owner_name}</p>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{vehicle.total_scans || 0} Telemetry Checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-sky-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">SOS Shield Active</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 lg:pt-0">
              <Link
                href={`/dashboard/vehicles/${vehicle.id}/qr`}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg flex items-center gap-3"
              >
                <Eye size={16} />
                Manage QR
              </Link>

              <Link 
                href={`/v/${vehicle.qr_slug}`} 
                target="_blank" 
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 flex items-center gap-3"
              >
                <ExternalLink size={16} />
                Public Hub
              </Link>
              
              <Link
                href={admin ? `/dashboard/admin/vehicles/${vehicle.id}` : `/dashboard/vehicles/${vehicle.id}/edit`}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 flex items-center gap-3"
              >
                <Settings size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
