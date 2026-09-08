function StatCard({ label, value, hint }) {
  return (
    <div className="flex-1 min-w-[200px] rounded-2xl border border-white/40 bg-white/30 p-5 backdrop-blur-xl shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-emerald-900/70">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-emerald-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-emerald-900/50">{hint}</p>}
    </div>
  );
}

export default StatCard;
