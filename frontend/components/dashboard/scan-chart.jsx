export function ScanChart({ data }) {
  const max = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="glass-panel rounded-3xl p-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Daily scan trend</h3>
        <p className="text-sm text-slate-400">Last 7 days of QR activity</p>
      </div>

      <div className="mt-8 grid h-64 grid-cols-7 items-end gap-3">
        {data.length ? (
          data.map((item) => (
            <div key={item.day} className="flex h-full flex-col justify-end gap-3">
              <div className="relative flex-1 rounded-3xl bg-white/5 p-2">
                <div
                  className="absolute inset-x-2 bottom-2 rounded-2xl bg-gradient-to-t from-glow to-neon"
                  style={{ height: `${Math.max((item.total / max) * 100, 10)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{item.total}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-7 text-sm text-slate-400">No scan activity yet.</p>
        )}
      </div>
    </div>
  );
}
