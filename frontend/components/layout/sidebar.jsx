"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CarFront, 
  LayoutDashboard, 
  ShieldAlert, 
  PlusSquare,
  Settings,
  LogOut
} from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/vehicles", label: "My Fleet", icon: CarFront },
  { href: "/dashboard/vehicles/new", label: "Register New", icon: PlusSquare },
];

export function Sidebar({ profile }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950 px-6 py-8 lg:flex">
      <div className="flex flex-col h-full">
        {/* Branding */}
        <Link href="/" className="px-2">
          <span className="text-xl font-black tracking-tighter text-white">
            SCAN<span className="text-neon">MY</span>CAR
          </span>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">
            Identity Systems
          </p>
        </Link>

        {/* Navigation */}
        <nav className="mt-12 flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                  isActive 
                    ? "bg-white/5 text-white" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 h-6 w-1 rounded-full bg-neon shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  />
                )}
                <item.icon className={`size-5 transition-colors ${isActive ? "text-neon" : "group-hover:text-neon"}`} />
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {profile?.role === "admin" && (
            <Link
              href="/dashboard/admin"
              className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                pathname?.startsWith("/dashboard/admin") 
                  ? "bg-white/5 text-white" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
               {pathname?.startsWith("/dashboard/admin") && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 h-6 w-1 rounded-full bg-glow shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                )}
              <ShieldAlert className={`size-5 transition-colors ${pathname?.startsWith("/dashboard/admin") ? "text-glow" : "group-hover:text-glow"}`} />
              <span className="text-sm font-semibold tracking-tight">Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Profile / Bottom Section */}
        <div className="mt-auto space-y-4">
          <div className="glass-panel rounded-[2rem] p-5 shadow-glass">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Authenticated As</p>
              <h4 className="mt-1 font-bold text-white truncate">{profile?.full_name || "User"}</h4>
              <p className="text-xs text-slate-400">{profile?.role === "admin" ? "Security Admin" : "Vehicle Owner"}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
