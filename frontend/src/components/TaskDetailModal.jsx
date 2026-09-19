import { getUrgency, formatDueDate, getInitials } from "../utils/taskUtils";

const PRIORITY_STYLES = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-violet-100 text-violet-700",
  low: "bg-teal-100 text-teal-700",
};

const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null;

  const urgency = getUrgency(task);
  const dueDateLabel = formatDueDate(task.dueDate);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/50 bg-white/95 p-6 shadow-2xl backdrop-blur-xl animate-[slide-in_0.2s_ease-out]"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
              PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
            }`}
          >
            {task.priority} priority
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full p-1 text-emerald-900/60 hover:bg-emerald-100 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>

        <h2 className="text-xl font-semibold text-emerald-950">{task.title}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-emerald-900/70">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
            {STATUS_LABELS[task.status]}
          </span>
          {dueDateLabel && (
            <span
              className={
                urgency === "overdue"
                  ? "font-medium text-rose-600"
                  : urgency === "due-soon"
                  ? "font-medium text-amber-600"
                  : ""
              }
            >
              📅 Due {dueDateLabel}
              {urgency === "overdue" && " (Overdue)"}
              {urgency === "due-soon" && " (Due soon)"}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-emerald-900/80">
            {task.description}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-emerald-900/10 pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-emerald-900/50">Created by</span>
            <span className="flex items-center gap-2 font-medium text-emerald-950">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-semibold text-white">
                {getInitials(task.owner?.name)}
              </span>
              {task.owner?.name ?? "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-emerald-900/50">Assigned to</span>
            {task.assignedTo ? (
              <span className="flex items-center gap-2 font-medium text-emerald-950">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-semibold text-white">
                  {getInitials(task.assignedTo.name)}
                </span>
                {task.assignedTo.name}
              </span>
            ) : (
              <span className="text-emerald-900/50">Unassigned</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-900/50">
            <span>Last updated</span>
            <span>{new Date(task.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="flex-1 cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            Edit Task
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="cursor-pointer rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
