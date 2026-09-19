import { useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationApi";

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data.notifications);
    setUnreadCount(res.data.unreadCount);
  };

  useEffect(() => {
    const timeout = setTimeout(fetchNotifications, 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) fetchNotifications();
  };

  const handleMarkRead = async (notification) => {
    if (notification.read) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(notification._id);
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative cursor-pointer rounded-full p-2 text-emerald-900/70 hover:bg-white/50 hover:text-emerald-900"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-white/50 bg-white/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-emerald-900/10 px-4 py-3">
            <span className="text-sm font-semibold text-emerald-950">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="cursor-pointer text-xs font-medium text-emerald-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-center text-sm text-emerald-900/50">
                No notifications yet
              </p>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleMarkRead(n)}
                className={`flex w-full flex-col gap-0.5 border-b border-emerald-900/5 px-4 py-3 text-left text-sm transition hover:bg-emerald-50 ${
                  n.read ? "text-emerald-900/60" : "bg-emerald-50/60 text-emerald-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                  {n.message}
                </span>
                <span className="text-xs text-emerald-900/40">{timeAgo(n.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
