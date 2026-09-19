function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/50 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-base font-semibold text-emerald-950">{title}</h3>
        <p className="mt-2 text-sm text-emerald-900/70">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg border border-emerald-900/20 px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
