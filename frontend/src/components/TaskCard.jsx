const PRIORITY_STYLES = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-violet-100 text-violet-700",
  low: "bg-teal-100 text-teal-700",
};

function TaskCard({ task }) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/50 p-4 backdrop-blur-md shadow-sm transition hover:bg-white/70">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-emerald-950">{task.title}</h3>
      {task.description && (
        <p className="mt-1 text-xs text-emerald-900/60">{task.description}</p>
      )}
    </div>
  );
}

export default TaskCard;
