const DUE_SOON_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

export function getUrgency(task) {
  if (!task.dueDate || task.status === "done") return null;

  const due = new Date(task.dueDate).getTime();
  const now = Date.now();

  if (due < now) return "overdue";
  if (due - now <= DUE_SOON_WINDOW_MS) return "due-soon";
  return null;
}

export function formatDueDate(dueDate) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function sortTasks(tasks, sortBy) {
  const copy = [...tasks];
  switch (sortBy) {
    case "dueDate":
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    case "priority":
      return copy.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    case "updated":
      return copy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    default:
      return copy;
  }
}
