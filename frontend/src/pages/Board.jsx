import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { createTask, updateTask, deleteTask } from "../api/taskApi";

const COLUMNS = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

function Board() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await axiosInstance.get("/tasks");
      setTasks(res.data);
    };
    fetchTasks();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleAddClick = () => {
    setEditingTask(null); setModalOpen(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task); setModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    if (editingTask) {
      const res = await updateTask(editingTask._id, data);
      setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data : t)));
    } else {
      const res = await createTask(data);
      setTasks((prev) => [...prev, res.data]);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`);
    if (!confirmed) return;
    await deleteTask(task._id);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  const handleMoveNext = async (task) => {
    const next = task.status === "todo" ? "in-progress" : "done";
    const res = await updateTask(task._id, { status: next });
    setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
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

      <main className="flex flex-1 gap-4 overflow-x-auto px-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasks.filter((t) => t.status === col.status)}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onMoveNext={handleMoveNext}
          />
        ))}
      </main>

      <TaskModal
        key={editingTask?._id ?? "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialTask={editingTask}
      />
    </div>
  );
}

export default Board;
