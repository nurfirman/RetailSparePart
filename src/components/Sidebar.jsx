import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  Package,
  ArrowDownUp,
  BarChart3,
  Settings,
  ShieldAlert,
} from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || "Owner / Administrator";

  const menuItems = [
    {
      id: "pos",
      label: "Kasir (POS)",
      icon: ShoppingCart,
      roles: ["Owner / Administrator", "Kasir (POS Operator)"],
    },
    {
      id: "master",
      label: "Master Sparepart",
      icon: Package,
      roles: ["Owner / Administrator", "Petugas Gudang (Inventory Admin)"],
    },
    {
      id: "inventory",
      label: "Kelola Inventaris",
      icon: ArrowDownUp,
      roles: ["Owner / Administrator", "Petugas Gudang (Inventory Admin)"],
    },
    {
      id: "reports",
      label: "Laporan & Analitik",
      icon: BarChart3,
      roles: ["Owner / Administrator", "Petugas Gudang (Inventory Admin)"],
    },
    {
      id: "settings",
      label: "Pengaturan & Cloud",
      icon: Settings,
      roles: ["Owner / Administrator", "Petugas Gudang (Inventory Admin)", "Kasir (POS Operator)"],
    },
  ];

  return (
    <aside
      style={{
        width: "240px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        padding: "1rem 0.75rem",
      }}
    >
      <div style={{ padding: "0 0.5rem 1rem 0.5rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Navigasi Modul
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = item.roles.includes(role);
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => isAllowed && setActiveTab(item.id)}
              disabled={!isAllowed}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: isActive ? "var(--primary)" : "transparent",
                color: isActive
                  ? "#ffffff"
                  : isAllowed
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 700 : 500,
                cursor: isAllowed ? "pointer" : "not-allowed",
                opacity: isAllowed ? 1 : 0.4,
                transition: "var(--transition)",
                textAlign: "left",
              }}
            >
              <Icon size={18} color={isActive ? "#ffffff" : isAllowed ? "var(--primary)" : "var(--text-muted)"} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {!isAllowed && <ShieldAlert size={14} color="var(--rose)" />}
            </button>
          );
        })}
      </nav>

      {/* Footer System info */}
      <div
        style={{
          padding: "0.75rem",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>SparePart POS v1.0</div>
        <div>Offline-First &amp; Supabase Ready</div>
      </div>
    </aside>
  );
}
