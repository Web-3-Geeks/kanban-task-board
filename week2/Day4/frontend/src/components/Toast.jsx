const TYPE_STYLES = {
  error: "bg-rose-600",
  success: "bg-emerald-700",
  info: "bg-emerald-900",
};

function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-[toast-in_0.2s_ease-out] rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
            TYPE_STYLES[t.type] ?? TYPE_STYLES.info
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default Toast;
