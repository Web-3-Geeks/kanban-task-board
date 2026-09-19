import { useEffect, useState, useCallback } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import TaskDetailModal from "../components/TaskDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";
import FilterBar from "../components/FilterBar";
import Toast from "../components/Toast";
import { getTasks, createTask, updateTask, deleteTask } from "../api/taskApi";
import { getUsers } from "../api/userApi";
import { sortTasks } from "../utils/taskUtils";
import { useToast } from "../hooks/useToast";

const COLUMNS = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

const EMPTY_FILTERS = { search: "", priority: "", assignedTo: "", dueFrom: "", dueTo: "" };

function Board() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem("kanban_sort") ?? "");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);
  const [activeDragTask, setActiveDragTask] = useState(null);

  const { toasts, showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.priority) params.priority = filters.priority;
    if (filters.assignedTo) params.assignedTo = filters.assignedTo;
    if (filters.dueFrom) params.dueFrom = filters.dueFrom;
    if (filters.dueTo) params.dueTo = filters.dueTo;

    const res = await getTasks(params);
    setTasks(res.data);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      fetchTasks().finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  useEffect(() => {
    getUsers().then((res) => setUsers(res.data));
  }, []);

  const markPending = (id, isPending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => setFilters(EMPTY_FILTERS);

  const handleSortChange = (value) => {
    setSortBy(value);
    localStorage.setItem("kanban_sort", value);
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditClick = (task) => {
    setDetailTask(null);
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    if (editingTask) {
      const res = await updateTask(editingTask._id, data);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
      showToast("Task updated", "success");
    } else {
      const res = await createTask(data);
      setTasks((prev) => [res.data, ...prev]);
      showToast("Task created", "success");
    }
  };

  const handleDeleteRequest = (task) => {
    setDetailTask(null);
    setConfirmTask(task);
  };

  const handleDeleteConfirm = async () => {
    const task = confirmTask;
    setConfirmTask(null);
    try {
      await deleteTask(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      showToast("Task deleted", "success");
    } catch {
      showToast("Failed to delete task", "error");
    }
  };

  const handleOpenDetail = (task) => setDetailTask(task);

  const applyStatusChange = async (task, nextStatus) => {
    if (pendingIds.has(task._id)) return;

    const previousTasks = tasks;
    markPending(task._id, true);
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await updateTask(task._id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch {
      setTasks(previousTasks);
      showToast("Couldn't move task — reverted", "error");
    } finally {
      markPending(task._id, false);
    }
  };

  const handleMoveNext = (task) => {
    const next = task.status === "todo" ? "in-progress" : "done";
    applyStatusChange(task, next);
  };

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveDragTask(task ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragTask(null);
    if (!over) return;

    const task = tasks.find((t) => t._id === active.id);
    const newStatus = over.id;
    if (!task || task.status === newStatus) return;

    applyStatusChange(task, newStatus);
  };

  const totalCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-lime-100 pb-6">
      <Navbar />

      <div className="flex flex-wrap items-center gap-4 p-4">
        <StatCard label="Total Task" value={totalCount} />
        <StatCard label="In Progress" value={inProgressCount} />
        <StatCard label="Completed" value={doneCount} />

        <button
          type="button"
          onClick={handleAddClick}
          className="ml-auto cursor-pointer rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
        >
          + Add Task
        </button>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        users={users}
      />

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex flex-1 gap-4 overflow-x-auto px-4">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-emerald-900/50">
              Loading tasks...
            </div>
          ) : (
            COLUMNS.map((col) => (
              <Column
                key={col.status}
                title={col.title}
                status={col.status}
                tasks={sortTasks(
                  tasks.filter((t) => t.status === col.status),
                  sortBy
                )}
                onEdit={handleEditClick}
                onDelete={handleDeleteRequest}
                onMoveNext={handleMoveNext}
                onOpenDetail={handleOpenDetail}
              />
            ))
          )}
        </main>

        <DragOverlay>
          {activeDragTask && (
            <div className="w-[260px] rounded-xl border border-white/60 bg-white/90 p-4 shadow-xl">
              <p className="text-sm font-semibold text-emerald-950">
                {activeDragTask.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        key={editingTask?._id ?? "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
        users={users}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={handleEditClick}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={!!confirmTask}
        title="Delete task?"
        message={confirmTask ? `"${confirmTask.title}" will be permanently deleted.` : ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmTask(null)}
      />

      <Toast toasts={toasts} />
    </div>
  );
}

export default Board;
