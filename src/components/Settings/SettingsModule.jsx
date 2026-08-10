import React, { useState, useEffect } from "react";
import { getNeonConfig, saveNeonConfig, testNeonConnection } from "../../services/neonClient";
import { syncNow } from "../../services/syncService";
import { resetAndReseedDatabase, db } from "../../db/offlineDb";
import {
  Settings,
  Cloud,
  Database,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  HardDrive,
} from "lucide-react";

export function SettingsModule() {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Local storage counts
  const [dbStats, setDbStats] = useState({
    products: 0,
    transactions: 0,
    syncQueue: 0,
  });

  useEffect(() => {
    const cfg = getNeonConfig();
    setDatabaseUrl(cfg.databaseUrl);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const p = await db.products.count();
      const t = await db.transactions.count();
      const q = await db.sync_queue.where("status").equals("PENDING").count();
      setDbStats({ products: p, transactions: t, syncQueue: q });
    } catch (e) {}
  };

  const handleSaveConfig = () => {
    saveNeonConfig(databaseUrl);
    alert("Konfigurasi Database Neon berhasil disimpan di Browser LocalStorage!");
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    saveNeonConfig(databaseUrl);
    const res = await testNeonConnection();
    setTesting(false);
    setTestResult(res);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncNow();
    setSyncing(false);
    setSyncResult(res);
    loadStats();
  };

  const handleResetData = async () => {
    if (confirm("Apakah Anda yakin ingin mereset dan mengisi ulang data dummy awal ke IndexedDB lokal? Transaksi baru akan terhapus.")) {
      await resetAndReseedDatabase();
      alert("Database lokal berhasil direset dan diisi data dummy baru!");
      loadStats();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          Pengaturan System &amp; Neon Postgres Cloud
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
          Konfigurasi Koneksi Serverless Database Cloud Neon, Engine Sync Offline &amp; Data Reset
        </p>
      </div>

      {/* 1. Neon Cloud Configuration Card */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Cloud size={20} /> Integrasi Neon Postgres Cloud Database
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="input-group">
            <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Globe size={14} /> Neon Connection String (PostgreSQL URL) *
            </label>
            <input
              type="password"
              className="input-control"
              placeholder="postgresql://username:password@ep-xyz.neon.tech/neondb?sslmode=require"
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Dapatkan Connection String dari Console Neon Anda (Project Settings / Dashboard Connection Details).
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button className="btn btn-primary" onClick={handleSaveConfig}>
              Simpan Connection String
            </button>
            <button className="btn btn-secondary" onClick={handleTestConnection} disabled={testing}>
              <RefreshCw size={14} className={testing ? "spin-icon" : ""} />
              {testing ? "Menguji..." : "Uji Koneksi Neon Cloud"}
            </button>
          </div>

          {testResult && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: testResult.success ? "var(--emerald-light)" : "var(--rose-light)",
                border: testResult.success ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
                color: testResult.success ? "#34d399" : "#f87171",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* 2. Offline Sync Engine & Local Storage Diagnostics */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <HardDrive size={20} /> Local Storage &amp; Sync Engine Status
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Produk Tersimpan (IndexedDB)</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{dbStats.products} SKU</div>
          </div>

          <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Transaksi POS</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>{dbStats.transactions} Struk</div>
          </div>

          <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Antrean Sync Pending</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: dbStats.syncQueue > 0 ? "var(--rose)" : "var(--emerald)" }}>
              {dbStats.syncQueue} Mutations
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-emerald" onClick={handleManualSync} disabled={syncing}>
            <RefreshCw size={16} className={syncing ? "spin-icon" : ""} />
            {syncing ? "Sinkronisasi..." : "Sinkronkan Sekarang ke Neon"}
          </button>

          <button className="btn btn-rose" onClick={handleResetData}>
            <RotateCcw size={16} /> Reset &amp; Re-seed Data Dummy
          </button>
        </div>

        {syncResult && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-sm)",
              background: syncResult.success ? "var(--emerald-light)" : "var(--rose-light)",
              color: syncResult.success ? "#34d399" : "#f87171",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {syncResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {syncResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
