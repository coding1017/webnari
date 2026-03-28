"use client";

import { useEffect, useRef } from "react";

export function AdminModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const maxW = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={`${maxW} w-full bg-ww-dark border border-ww-border rounded-xl shadow-2xl backdrop:bg-black/60 p-0 text-ww-white`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ww-border">
        <h2 className="font-head font-bold text-lg">{title}</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-ww-surface flex items-center justify-center text-ww-muted hover:text-ww-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  destructive = true,
  isPending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
}) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-ww-muted mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-ww-muted hover:text-ww-white rounded-lg hover:bg-ww-surface transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
            destructive
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-ww-purple text-white hover:bg-ww-purple/80"
          }`}
        >
          {isPending ? "..." : confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
}
