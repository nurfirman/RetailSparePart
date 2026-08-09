import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Wrench, LogIn, UserCheck, Key, Mail } from "lucide-react";

export function LoginModal({ isOpen, onClose }) {
  const { loginWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const res = await loginWithEmail(email, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setErrorMsg("");
    const res = await loginWithEmail(demoEmail, "123456");
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        <div className="modal-header" style={{ justifyContent: "center", textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <Wrench size={26} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Masuk System POS Sparepart</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Pilih akun demo atau gunakan email terdaftar
            </span>
          </div>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{ background: "var(--rose-light)", color: "#f87171", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Mail size={14} /> Email Pengguna *
              </label>
              <input
                type="email"
                required
                className="input-control"
                placeholder="email@sparepart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Key size={14} /> Kata Sandi *
              </label>
              <input
                type="password"
                required
                className="input-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg">
              <LogIn size={18} /> Masuk Sekarang
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.75rem", textTransform: "uppercase", textAlign: "center" }}>
              Quick Demo Sign In (1-Click Login):
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start" }}
                onClick={() => handleQuickDemoLogin("admin@sparepart.com")}
              >
                <UserCheck size={14} color="var(--primary)" /> Budi Santoso (Owner / Admin)
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start" }}
                onClick={() => handleQuickDemoLogin("gudang@sparepart.com")}
              >
                <UserCheck size={14} color="var(--emerald)" /> Agus Pratama (Petugas Gudang)
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start" }}
                onClick={() => handleQuickDemoLogin("kasir@sparepart.com")}
              >
                <UserCheck size={14} color="var(--amber)" /> Siti Rahma (Kasir POS Operator)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
