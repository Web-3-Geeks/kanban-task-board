import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import Column from "../components/Column";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

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
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-lime-100 pb-6">
      <Navbar />

      <div className="flex flex-wrap gap-4 p-4">
        <StatCard label="Total Task" value={totalCount} />
        <StatCard label="In Progress" value={inProgressCount} />
        <StatCard label="Completed" value={doneCount} />
      </div>

      <main className="flex flex-1 gap-4 overflow-x-auto px-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={tasks.filter((t) => t.status === col.status)}
          />
        ))}
      </main>
    </div>
  );
}

export default Board;
