"use client";

import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar({ user, profile }) {
  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 backdrop-blur-xl lg:px-10">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white">
          <Menu className="size-5" />
        </button>
        <Link href="/" className="text-lg font-black tracking-tighter text-white">
          SCAN<span className="text-neon">MY</span>CAR
        </Link>
      </div>

      <div className="hidden lg:flex lg:items-center lg:gap-8">
        <h2 className="text-sm font-semibold tracking-tight text-slate-400">
          Control Panel <span className="mx-2 text-slate-700">/</span> 
          <span className="text-white">Operations</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-1.5 px-4 lg:flex">
          <Search className="size-4 text-slate-500" />
          <input 
            placeholder="Search fleet..." 
            className="bg-transparent text-xs font-medium text-white outline-none placeholder:text-slate-600 w-32"
          />
        </div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 text-slate-400 shadow-xl"
        >
          <User className="size-5" />
        </motion.div>
      </div>
    </nav>
  );
}
