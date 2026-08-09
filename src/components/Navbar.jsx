import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { isOnlineNetwork, syncNow } from "../services/syncService";
import { db } from "../db/offlineDb";
import {
  Wrench,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Database,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function Navbar() {
  const { currentUser, allUsers, switchUser } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Monitor network status & sync queue size
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(async () => {
      try {
        const count = await db.sync_queue.where("status").equals("PENDING").count();
        setPendingCount(count);
      } catch (err) {
        // silent
      }
    }, 2000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleSyncClick = async () => {
    setSyncing(true);
    const res = await syncNow();
    setSyncing(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Auto &amp; Moto Parts Enterprise</span>
        </div>
      </div>

      {/* Network Status & Quick User Switching */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Network & Sync Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {online ? (
            <span className="badge badge-emerald">
              <Wifi size={13} /> Cloud Online (Supabase)
            </span>
          ) : (
            <span className="badge badge-amber">
              <WifiOff size={13} /> Local Mode (Offline)
            </span>
          )}

          {pendingCount > 0 && (
            <span className="badge badge-rose">
              <Database size={12} /> {pendingCount} sync pending
            </span>
          )}

          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className="btn btn-secondary btn-sm"
            title="Sinkronkan data lokal dengan database Cloud Supabase"
          >
            <RefreshCw size={13} className={syncing ? "spin-icon" : ""} />
            {syncing ? "Singkron..." : "Singkronkan"}
          </button>
        </div>

        {/* User Role & Switcher */}
        {currentUser && (
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
                width: '240px',
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--primary)',
          color: 'var(--text-primary)',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle size={18} color="var(--emerald)" />
          <span style={{ fontSize: '0.875rem' }}>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
