"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-white">
          {payload[0].value} <span className="text-xs font-normal text-slate-400">Scans</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ScanChart({ data }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[320px] w-full bg-slate-900/50 animate-pulse rounded-3xl" />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="glass-panel overflow-hidden rounded-3xl p-6 min-w-0"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Daily scan trend</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Last 7 days activity</p>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
          REAL-TIME
        </div>
      </div>

      <div className="mt-8 h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
