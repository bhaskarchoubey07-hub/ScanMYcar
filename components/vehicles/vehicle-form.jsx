"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/browser";
import { 
  Car, 
  Trash2, 
  Save, 
  Smartphone, 
  ShieldAlert, 
  User, 
  Hash,
  Loader2,
  ChevronDown
} from "lucide-react";
import { pageReveal } from "@/lib/motion";

/**
 * Premium Vehicle Input
 */
function PremiumInput({ label, icon: Icon, value, onChange, placeholder = " ", error, type = "text", required = true }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="relative group w-full mb-6">
      <div 
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
          error 
            ? "border-red-500/50 bg-red-500/5" 
            : isFocused 
              ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
              : "border-white/10 bg-white/5 group-hover:border-white/20"
        }`}
      >
        {Icon && <Icon className={`w-5 h-5 ${isFocused ? "text-emerald-400" : "text-slate-400"}`} />}
        <div className="relative flex-1">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className="w-full bg-transparent outline-none text-white text-base font-medium placeholder-transparent"
            placeholder={placeholder}
          />
          <label 
            className={`absolute left-0 pointer-events-none transition-all duration-300 ${
              isFocused || value 
                ? "-top-6 text-xs font-semibold text-emerald-400 uppercase tracking-widest" 
                : "top-0 text-base text-slate-500"
            }`}
          >
            {label}
          </label>
        </div>
      </div>
    </div>
  );
}

export function VehicleForm({ vehicle }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    vehicle_number: vehicle?.vehicle_number || "",
    vehicle_type: vehicle?.vehicle_type || "Car",
    owner_name: vehicle?.owner_name || "",
    owner_phone: vehicle?.owner_phone || "",
    emergency_contact: vehicle?.emergency_contact || "",
    medical_info: vehicle?.medical_info || "",
    is_public: vehicle?.is_public ?? true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        const vehicleData = {
          ...formData,
          user_id: user.id,
          // Generate unique slug for new vehicles if not editing
          qr_slug: vehicle?.qr_slug || `${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
        };

        let result;
        if (vehicle?.id) {
          result = await supabase
            .from('vehicles')
            .update(vehicleData)
            .eq('id', vehicle.id);
        } else {
          result = await supabase
            .from('vehicles')
            .insert([vehicleData]);
        }

        if (result.error) throw result.error;

        toast.success(vehicle ? "Profile updated." : "Vehicle registered.");
        router.push("/dashboard/vehicles");
        router.refresh();
      } catch (err) {
        toast.error(err.message || "Operation failed");
      }
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently wipe this identity?")) return;
    
    startTransition(async () => {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);
        
        if (error) throw error;

        toast.success("Identity purged.");
        router.push("/dashboard/vehicles");
        router.refresh();
      } catch (err) {
        toast.error("Cleanup failed.");
      }
    });
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial="hidden" animate="visible" variants={pageReveal}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="glass-panel rounded-[2.5rem] p-8 lg:p-10">
        <div className="grid md:grid-cols-2 gap-x-8">
          <PremiumInput 
            label="Vehicle Number" 
            icon={Hash} 
            value={formData.vehicle_number} 
            onChange={v => setFormData(p => ({...p, vehicle_number: v}))}
            placeholder="KA 01 AB 1234"
          />

          <div className="relative mb-6">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5">
              <Car className="w-5 h-5 text-slate-400" />
              <div className="flex-1">
                <select 
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData(p => ({...p, vehicle_type: e.target.value}))}
                  className="w-full bg-transparent outline-none text-white text-base font-medium appearance-none cursor-pointer"
                >
                  <option className="bg-slate-900" value="Car">Sedan / SUV</option>
                  <option className="bg-slate-900" value="Two-wheeler">Motorcycle</option>
                  <option className="bg-slate-900" value="Commercial">Truck</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
                <label className="absolute left-10 -top-6 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                  Category
                </label>
              </div>
            </div>
          </div>

          <PremiumInput 
            label="Owner Name" 
            icon={User} 
            value={formData.owner_name} 
            onChange={v => setFormData(p => ({...p, owner_name: v}))}
          />

          <PremiumInput 
            label="Owner Phone" 
            icon={Smartphone} 
            value={formData.owner_phone} 
            onChange={v => setFormData(p => ({...p, owner_phone: v}))}
            type="tel"
          />

          <PremiumInput 
            label="Emergency Contact" 
            icon={ShieldAlert} 
            value={formData.emergency_contact} 
            onChange={v => setFormData(p => ({...p, emergency_contact: v}))}
            type="tel"
          />

          <div className="md:col-span-2">
            <div className="relative group w-full mb-6">
              <div className="px-4 py-4 rounded-2xl border border-white/10 bg-white/5">
                <textarea 
                  value={formData.medical_info}
                  onChange={(e) => setFormData(p => ({...p, medical_info: e.target.value}))}
                  rows={4}
                  className="w-full bg-transparent outline-none text-white text-base font-medium placeholder-slate-600 resize-none"
                  placeholder="Medical history (Visible in emergency scans)"
                />
                <label className="absolute left-4 -top-6 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                  Medical Info (Optional)
                </label>
              </div>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer group hover:text-white transition-colors">
          <input 
            type="checkbox" 
            checked={formData.is_public}
            onChange={(e) => setFormData(p => ({...p, is_public: e.target.checked}))}
            className="w-5 h-5 rounded border-white/10 bg-white/5 checked:bg-emerald-500 appearance-none transition-all cursor-pointer"
          />
          <span>Public Discovery (Enable SOS access)</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 h-16"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {vehicle ? "Commit Update" : "Register Vehicle"}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest rounded-2xl transition-all h-16"
          >
            Cancel
          </button>
        </div>

        {vehicle && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 h-16"
          >
            <Trash2 className="w-5 h-5" />
            Delete Identity
          </button>
        )}
      </div>
    </motion.form>
  );
}
