'use client';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <section className="w-full max-w-md rounded-2xl border border-[#1e1e24] bg-[#0f0f14] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#e8e8f0]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#888]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#1e1e24] px-4 py-2 text-sm font-semibold text-[#888] hover:text-[#d0d0dc]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
