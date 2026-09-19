import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getUrgency, formatDueDate, getInitials } from "../utils/taskUtils";

const PRIORITY_STYLES = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-violet-100 text-violet-700",
  low: "bg-teal-100 text-teal-700",
};

const URGENCY_STYLES = {
  overdue: "border-l-4 border-l-rose-500",
  "due-soon": "border-l-4 border-l-amber-500",
};

const STATUS_FLOW = {
  todo: { next: "in-progress", label: "Start" },
  "in-progress": { next: "done", label: "Complete" },
  done: { next: null, label: null },
};

function TaskCard({ task, onEdit, onDelete, onMoveNext, onOpenDetail, onCyclePriority }) {
  const dueDateLabel = formatDueDate(task.dueDate);
  const nextStep = STATUS_FLOW[task.status];
  const urgency = getUrgency(task);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onOpenDetail(task)}
      className={`group cursor-pointer touch-none rounded-xl border border-white/50 bg-white/50 p-4 backdrop-blur-md shadow-sm transition hover:bg-white/70 ${
        URGENCY_STYLES[urgency] ?? ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={stop(onCyclePriority)}
          title="Click to cycle priority"
          className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium capitalize transition hover:brightness-95 ${
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
          }`}
        >
          {task.priority}
        </button>

        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={stop(onEdit)}
            aria-label="Edit task"
            className="cursor-pointer rounded-md p-1 text-emerald-900/50 hover:bg-emerald-100 hover:text-emerald-900"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={stop(onDelete)}
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
        <div className="flex items-center gap-2">
          {dueDateLabel && (
            <span
              className={`text-xs ${
                urgency === "overdue"
                  ? "font-medium text-rose-600"
                  : urgency === "due-soon"
                  ? "font-medium text-amber-600"
                  : "text-emerald-900/50"
              }`}
            >
              📅 {dueDateLabel}
            </span>
          )}
          {task.assignedTo && (
            <span
              title={task.assignedTo.name}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-semibold text-white"
            >
              {getInitials(task.assignedTo.name)}
            </span>
          )}
        </div>

        {nextStep.next && (
          <button
            type="button"
            onClick={stop(onMoveNext)}
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
