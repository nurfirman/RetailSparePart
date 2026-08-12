import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  Package,
  ArrowDownUp,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser } = useAuth();
  const role = currentUser?.role || "Owner / Administrator";

  // Auto-collapse sidebar on tablet screens (<= 1024px)
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      roles: ["Owner / Administrator"],
    },
  ];

  return (
    <aside
      style={{
        width: collapsed ? "68px" : "240px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        padding: collapsed ? "1rem 0.4rem" : "1rem 0.75rem",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 0.5rem 1rem 0.5rem", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
        {!collapsed && (
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Navigasi Modul
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            borderRadius: "var(--radius-sm)",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title={collapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
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
              title={collapsed ? `${item.label}${!isAllowed ? ' (Akses Dibatasi)' : ''}` : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "0.75rem",
                padding: collapsed ? "0.75rem 0" : "0.75rem 1rem",
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
              <Icon size={18} color={isActive ? "#ffffff" : isAllowed ? "var(--primary)" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              {!collapsed && !isAllowed && <ShieldAlert size={14} color="var(--rose)" style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </nav>

      {/* Footer System info */}
      {!collapsed && (
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
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>SparePart POS v1.1</div>
          <div>Offline-First &amp; Neon Postgres</div>
        </div>
      )}
    </aside>
  );
}
