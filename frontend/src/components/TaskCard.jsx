const PRIORITY_STYLES = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-violet-100 text-violet-700",
  low: "bg-teal-100 text-teal-700",
};

const STATUS_FLOW = {
  todo: { next: "in-progress", label: "Start" },
  "in-progress": { next: "done", label: "Complete" },
  done: { next: null, label: null },
};

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TaskCard({ task, onEdit, onDelete, onMoveNext }) {
  const dueDateLabel = formatDueDate(task.dueDate);
  const nextStep = STATUS_FLOW[task.status];

  return (
    <div className="group rounded-xl border border-white/50 bg-white/50 p-4 backdrop-blur-md shadow-sm transition hover:bg-white/70">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="cursor-pointer rounded-md p-1 text-emerald-900/50 hover:bg-emerald-100 hover:text-emerald-900"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="cursor-pointer rounded-md p-1 text-emerald-900/50 hover:bg-rose-100 hover:text-rose-700"
          >
            🗑
          </button>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-emerald-950">{task.title}</h3>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-emerald-900/60">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {dueDateLabel ? (
          <span className="text-xs text-emerald-900/50">📅 {dueDateLabel}</span>
        ) : (
          <span />
        )}

        {nextStep.next && (
          <button
            type="button"
            onClick={() => onMoveNext(task)}
            className="cursor-pointer rounded-full border border-emerald-700/30 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
          >
            {nextStep.label} →
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
