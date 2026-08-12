import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext();

let toastId = 0;

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: "var(--emerald-light)", border: "rgba(16,185,129,0.4)", color: "#34d399", icon: "var(--emerald)" },
  error: { bg: "var(--rose-light)", border: "rgba(239,68,68,0.4)", color: "#f87171", icon: "var(--rose)" },
  warning: { bg: "var(--amber-light)", border: "rgba(245,158,11,0.4)", color: "#fbbf24", icon: "var(--amber)" },
  info: { bg: "var(--primary-light)", border: "rgba(59,130,246,0.4)", color: "#60a5fa", icon: "var(--primary)" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur ?? 6000),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  }, [addToast]);

  // Reassign as object with methods
  const toastApi = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur ?? 6000),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      {/* Toast Container — fixed bottom-right */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          display: "flex",
          flexDirection: "column-reverse",
          gap: "0.5rem",
          zIndex: 50000,
          maxWidth: "420px",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const style = COLORS[t.type] || COLORS.info;
          const Icon = ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${style.border}`,
                borderLeft: `4px solid ${style.icon}`,
                color: "var(--text-primary)",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                animation: "toastSlideIn 0.3s ease-out",
                pointerEvents: "auto",
              }}
            >
              <Icon size={20} color={style.icon} style={{ flexShrink: 0, marginTop: "1px" }} />
              <span style={{ flex: 1, fontSize: "0.875rem", lineHeight: 1.5 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "2px",
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if outside provider
    return {
      success: (msg) => console.log("[toast:success]", msg),
      error: (msg) => console.error("[toast:error]", msg),
      warning: (msg) => console.warn("[toast:warning]", msg),
      info: (msg) => console.info("[toast:info]", msg),
    };
  }
  return ctx;
}
