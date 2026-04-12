export function StatCard({ label, value, accent = "neon", helper }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <p className={`text-xs uppercase tracking-[0.35em] ${accent === "glow" ? "text-glow" : "text-neon"}`}>{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-400">{helper}</p>}
    </div>
  );
}
