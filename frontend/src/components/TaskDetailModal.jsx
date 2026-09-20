import { useEffect, useState } from "react";
import { getUrgency, formatDueDate, getInitials } from "../utils/taskUtils";
import { useAuth } from "../context/AuthContext";
import { getComments, createComment, updateComment, deleteComment } from "../api/commentApi";
import { getActivity } from "../api/activityApi";

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

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function CommentItem({ comment, onEdit, onDelete }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const isMine = comment.author?._id === user?.id;

  const handleSave = async () => {
    if (!text.trim()) return;
    await onEdit(comment._id, text.trim());
    setEditing(false);
  };

  return (
    <div className="rounded-lg bg-white/60 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-medium text-emerald-950">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-[9px] font-semibold text-white">
            {getInitials(comment.author?.name)}
          </span>
          {comment.author?.name}
          <span className="font-normal text-emerald-900/40">
            {timeAgo(comment.createdAt)}
          </span>
        </span>
        {isMine && !editing && (
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100 hover:opacity-100">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit comment"
              className="cursor-pointer rounded p-0.5 text-emerald-900/40 hover:text-emerald-900"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment._id)}
              aria-label="Delete comment"
              className="cursor-pointer rounded p-0.5 text-emerald-900/40 hover:text-rose-700"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="resize-none rounded-lg border border-emerald-900/20 bg-white px-2 py-1 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setText(comment.content);
                setEditing(false);
              }}
              className="cursor-pointer text-xs text-emerald-900/60 hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="cursor-pointer text-xs font-medium text-emerald-700 hover:underline"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-emerald-900/80">{comment.content}</p>
      )}
    </div>
  );
}

function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [tab, setTab] = useState("comments");

  useEffect(() => {
    if (!task) return;
    console.log("[DEBUG] fetching for task", task._id);
    getComments(task._id).then((res) => {
      console.log("[DEBUG] comments response", res.data);
      setComments(res.data);
    });
    getActivity(task._id).then((res) => {
      console.log("[DEBUG] activity response", res.data);
      setActivity(res.data);
    });
  }, [task]);

  console.log("[DEBUG] render, comments.length=", comments.length, "task?._id=", task?._id);

  if (!task) return null;

  const urgency = getUrgency(task);
  const dueDateLabel = formatDueDate(task.dueDate);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await createComment(task._id, newComment.trim());
    setComments((prev) => [...prev, res.data]);
    setNewComment("");
  };

  const handleEditComment = async (commentId, content) => {
    const res = await updateComment(commentId, content);
    setComments((prev) => prev.map((c) => (c._id === commentId ? res.data : c)));
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

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

        <div className="mt-6 flex border-b border-emerald-900/10">
          <button
            type="button"
            onClick={() => setTab("comments")}
            className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "comments"
                ? "border-emerald-700 text-emerald-900"
                : "border-transparent text-emerald-900/50"
            }`}
          >
            Comments ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("activity")}
            className={`cursor-pointer border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "activity"
                ? "border-emerald-700 text-emerald-900"
                : "border-transparent text-emerald-900/50"
            }`}
          >
            Activity ({activity.length})
          </button>
        </div>

        {tab === "comments" && (
          <div className="mt-3 flex flex-col gap-3">
            {comments.length === 0 && (
              <p className="text-center text-xs text-emerald-900/40">No comments yet</p>
            )}
            {comments.map((c) => (
              <div key={c._id} className="group">
                <CommentItem
                  comment={c}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              </div>
            ))}

            <form onSubmit={handleAddComment} className="mt-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Post
              </button>
            </form>
          </div>
        )}

        {tab === "activity" && (
          <div className="mt-3 flex flex-col gap-2">
            {activity.length === 0 && (
              <p className="text-center text-xs text-emerald-900/40">No activity yet</p>
            )}
            {activity.map((a) => (
              <div key={a._id} className="flex items-start gap-2 text-xs">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <p className="text-emerald-900/70">
                  <span className="font-medium text-emerald-950">{a.user?.name}</span>{" "}
                  {a.action}
                  {a.previousValue && a.newValue && (
                    <>
                      {" "}
                      from <span className="italic">{a.previousValue}</span> to{" "}
                      <span className="italic">{a.newValue}</span>
                    </>
                  )}
                  <span className="ml-1 text-emerald-900/40">{timeAgo(a.createdAt)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetailModal;
