import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Wrench, LogIn, UserPlus, UserCheck, Key, Mail, User, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function LoginModal({ isOpen, onClose, initialMode = "login" }) {
  const { loginWithEmail, signUpWithEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Kasir (POS Operator)");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const pScore = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isRegister) {
      if (password !== confirmPassword) {
        setErrorMsg("Konfirmasi kata sandi tidak cocok.");
        return;
      }

      if (password.length < 8) {
        setErrorMsg("Kata sandi minimal 8 karakter demi keamanan.");
        return;
      }

      const res = await signUpWithEmail({ name, email, password, role });
      if (res.success) {
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    setErrorMsg("");
    setSuccessMsg("");
    const res = await loginWithEmail(demoEmail, demoPass);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "460px", padding: "1.75rem" }}>
        {/* Top Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(37,99,235,0.3)",
              marginBottom: "0.75rem",
            }}
          >
            <Wrench size={28} color="#ffffff" />
          </div>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            {isRegister ? "Buat Akun AutoPart Pro" : "Masuk Sistem POS Sparepart"}
          </h3>
          <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
            {isRegister ? "Daftar untuk mengelola toko sparepart & bengkel Anda" : "Kelola transaksi, stok barang & laporan penjualan"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.05)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "7px",
              border: "none",
              background: !isRegister ? "var(--primary)" : "transparent",
              color: !isRegister ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              setIsRegister(false);
              setErrorMsg("");
            }}
          >
            <LogIn size={15} /> Masuk (Sign In)
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "7px",
              border: "none",
              background: isRegister ? "var(--primary)" : "transparent",
              color: isRegister ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              setIsRegister(true);
              setErrorMsg("");
            }}
          >
            <UserPlus size={15} /> Daftar Akun (Register)
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle2 size={16} />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {isRegister && (
            <div className="input-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <User size={14} /> Nama Lengkap Pengguna *
              </label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Contoh: Hendra Wijaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Mail size={14} /> Email Pengguna *
            </label>
            <input
              type="email"
              required
              className="input-control"
              placeholder="nama@sparepart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="input-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <ShieldCheck size={14} /> Peran / Hak Akses *
              </label>
              <select className="input-control" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Kasir (POS Operator)">Kasir (POS Operator)</option>
                <option value="Petugas Gudang (Inventory Admin)">Petugas Gudang (Inventory Admin)</option>
                <option value="Owner / Administrator">Owner / Administrator (Akses Penuh)</option>
              </select>
            </div>
          )}

          <div className="input-group">
            <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Key size={14} /> Kata Sandi *
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px" }}
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="input-control"
              placeholder={isRegister ? "Minimal 8 karakter..." : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Password Strength Meter for Register */}
            {isRegister && password.length > 0 && (
              <div style={{ marginTop: "0.4rem" }}>
                <div style={{ display: "flex", height: "4px", gap: "4px", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ flex: 1, background: pScore >= 1 ? (pScore > 2 ? "#10b981" : "#f59e0b") : "#ef4444" }} />
                  <div style={{ flex: 1, background: pScore >= 2 ? (pScore > 2 ? "#10b981" : "#f59e0b") : "rgba(255,255,255,0.1)" }} />
                  <div style={{ flex: 1, background: pScore >= 3 ? "#10b981" : "rgba(255,255,255,0.1)" }} />
                  <div style={{ flex: 1, background: pScore >= 4 ? "#10b981" : "rgba(255,255,255,0.1)" }} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px" }}>
                  Kekuatan Password: {pScore < 2 ? "Lemah" : pScore === 2 ? "Sedang" : "Sangat Kuat (Aman)"}
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="input-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Key size={14} /> Ulangi Kata Sandi *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="input-control"
                placeholder="Ulangi kata sandi di atas..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: "0.5rem" }}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? "Daftar & Masuk Sekarang" : "Masuk Ke Sistem"}
          </button>
        </form>

        {/* Quick Demo Selector */}
        {!isRegister && (
          <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.6rem", textTransform: "uppercase", textAlign: "center" }}>
              Quick Demo 1-Click Sign In:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                onClick={() => handleQuickDemoLogin("admin@sparepart.com", "admin123")}
              >
                <UserCheck size={14} color="var(--primary)" /> Budi Santoso (Owner / Admin)
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                onClick={() => handleQuickDemoLogin("gudang@sparepart.com", "gudang123")}
              >
                <UserCheck size={14} color="var(--emerald)" /> Agus Pratama (Petugas Gudang)
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                onClick={() => handleQuickDemoLogin("kasir@sparepart.com", "kasir123")}
              >
                <UserCheck size={14} color="var(--amber)" /> Siti Rahma (Kasir POS Operator)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

