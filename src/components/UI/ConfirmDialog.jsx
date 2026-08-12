import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmDialog — replaces native confirm() with a styled modal
 * Usage: <ConfirmDialog isOpen={bool} title="..." message="..." onConfirm={fn} onCancel={fn} variant="danger|warning|info" />
 */
export function ConfirmDialog({
  isOpen,
  title = "Konfirmasi",
  message = "Apakah Anda yakin?",
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger", // "danger" | "warning" | "info"
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: { btnClass: "btn-rose", iconColor: "var(--rose)" },
    warning: { btnClass: "btn-amber", iconColor: "var(--amber)" },
    info: { btnClass: "btn-primary", iconColor: "var(--primary)" },
  };

  const vs = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "440px" }}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: variant === "danger" ? "var(--rose-light)" : variant === "warning" ? "var(--amber-light)" : "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={22} color={vs.iconColor} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn ${vs.btnClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for using confirm dialog imperatively
 * Returns [ConfirmDialogElement, showConfirm(options) => Promise<boolean>]
 */
export function useConfirmDialog() {
  const [state, setState] = useState({ isOpen: false, resolve: null, options: {} });

  const showConfirm = (options = {}) => {
    return new Promise((resolve) => {
      setState({ isOpen: true, resolve, options });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState({ isOpen: false, resolve: null, options: {} });
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState({ isOpen: false, resolve: null, options: {} });
  };

  const DialogElement = state.isOpen ? (
    <ConfirmDialog
      isOpen={true}
      title={state.options.title}
      message={state.options.message}
      confirmLabel={state.options.confirmLabel}
      cancelLabel={state.options.cancelLabel}
      variant={state.options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return [DialogElement, showConfirm];
}
