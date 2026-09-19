import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";

const HEADER_STYLES = {
  todo: "text-sky-800",
  "in-progress": "text-amber-800",
  done: "text-emerald-800",
};

function Column({ title, status, tasks, onEdit, onDelete, onMoveNext, onOpenDetail }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-1 flex-col rounded-2xl border p-4 backdrop-blur-xl shadow-sm transition ${
        isOver
          ? "border-emerald-500/60 bg-emerald-100/40"
          : "border-white/40 bg-white/25"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          className={`text-sm font-semibold ${
            HEADER_STYLES[status] ?? "text-emerald-900"
          }`}
        >
          {title}{" "}
          <span className="ml-1 rounded-full bg-white/60 px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <p className="rounded-lg bg-white/30 p-3 text-center text-xs text-emerald-900/50">
            No tasks yet
          </p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveNext={onMoveNext}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </div>
  );
}

export default Column;
