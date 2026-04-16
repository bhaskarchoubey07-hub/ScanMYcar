"use client";

import { motion } from "framer-motion";

export function Skeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-slate-800/50 ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel rounded-[2.25rem] p-6 space-y-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-[400px] rounded-3xl" />
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Skeleton className="h-[300px] rounded-3xl" />
        <div className="glass-panel rounded-3xl p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
