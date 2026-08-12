import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./UI/ToastProvider";
import { isOnlineNetwork, syncNow } from "../services/syncService";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/offlineDb";
import {
  Wrench,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Database,
  LogIn,
  LogOut,
  Clock,
} from "lucide-react";

export function Navbar({ onOpenLogin }) {
  const { currentUser, allUsers, switchUser, logout } = useAuth();
  const toast = useToast();
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use Dexie LiveQuery instead of polling interval for pending count
  const pendingCount = useLiveQuery(
    () => db.sync_queue.where("status").equals("PENDING").count(),
    [],
    0
  );

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => { setOnline(true); toast.info("Koneksi internet tersambung kembali."); };
    const handleOffline = () => { setOnline(false); toast.warning("Koneksi internet terputus. Mode offline aktif."); };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  // Live clock (inspired by Color Admin POS header)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncClick = async () => {
    setSyncing(true);
    const res = await syncNow();
    setSyncing(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.info("Anda telah keluar dari sistem.");
  };

  const timeStr = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateStr = currentTime.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="navbar-container" style={{
      height: '64px',
      background: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Wrench size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            OtoSparePart <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.85rem' }}>POS &amp; Inventory</span>
          </h1>
          <span className="hide-on-tablet" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Auto &amp; Moto Parts Enterprise</span>
        </div>
      </div>

      {/* Center: Live Clock (Color Admin POS style) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Clock size={14} color="var(--primary)" />
        <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
          {timeStr}
        </span>
        <span className="hide-on-tablet" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr}</span>
      </div>

      {/* Right: Network Status, Sync, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Network & Sync Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {online ? (
            <span className="badge badge-emerald">
              <Wifi size={13} /> <span className="hide-on-tablet">Neon Cloud</span>
            </span>
          ) : (
            <span className="badge badge-amber">
              <WifiOff size={13} /> <span className="hide-on-tablet">Offline Mode</span>
            </span>
          )}

          {pendingCount > 0 && (
            <span className="badge badge-rose">
              <Database size={12} /> {pendingCount} pending
            </span>
          )}

          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className="btn btn-secondary btn-sm"
            title="Sinkronkan data lokal dengan Neon Postgres Cloud"
          >
            <RefreshCw size={13} className={syncing ? "spin-icon" : ""} />
            {syncing ? "Sync..." : "Sync"}
          </button>
        </div>

        {/* User Role & Switcher */}
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserCheck size={14} color="var(--primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{currentUser.role}</div>
              </div>
              <ChevronDown size={14} />
            </button>

            {userDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 999
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.25rem 0.5rem', textTransform: 'uppercase' }}>
                  Ganti Pengguna &amp; Peran:
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setUserDropdownOpen(false);
                      toast.success(`Berganti ke ${u.name}`);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: currentUser.id === u.id ? 'var(--primary-light)' : 'transparent',
                      color: currentUser.id === u.id ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <strong>{u.name}</strong>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{u.role}</span>
                  </button>
                ))}

                {/* Logout button */}
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.5rem' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--rose)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <LogOut size={14} /> Keluar (Logout)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
            <LogIn size={14} /> Masuk
          </button>
        )}
      </div>
    </header>
  );
}
