import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/UI/ToastProvider";
import { ErrorBoundary } from "./components/UI/ErrorBoundary";
import { initializeLocalDatabase } from "./db/offlineDb";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { POSModule } from "./components/POS/POSModule";
import { ProductMaster } from "./components/Master/ProductMaster";
import { InventoryModule } from "./components/Inventory/InventoryModule";
import { ReportsModule } from "./components/Reports/ReportsModule";
import { SettingsModule } from "./components/Settings/SettingsModule";
import { LoginModal } from "./components/Auth/LoginModal";

function MainContent() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("pos");
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  // Show login if no user is authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      setIsLoginOpen(true);
    }
  }, [loading, currentUser]);

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", color: "var(--text-primary)", flexDirection: "column", gap: "1rem" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "3px solid var(--border)",
          borderTop: "3px solid var(--primary)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Memuat Sistem Sparepart POS...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If not logged in, show login overlay
  if (!currentUser) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <LoginModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  // RBAC: determine accessible tabs based on role
  const role = currentUser?.role || "";
  const isOwner = role === "Owner / Administrator";
  const isGudang = role === "Petugas Gudang (Inventory Admin)";
  const isKasir = role === "Kasir (POS Operator)";

  // Auto-redirect to allowed tab if current tab is not accessible
  const allowedTabs = {
    pos: isOwner || isKasir,
    master: isOwner || isGudang,
    inventory: isOwner || isGudang,
    reports: isOwner || isGudang,
    settings: isOwner,
  };

  // If current tab is not allowed, redirect to first allowed tab
  if (!allowedTabs[activeTab]) {
    const firstAllowed = Object.keys(allowedTabs).find((t) => allowedTabs[t]);
    if (firstAllowed && firstAllowed !== activeTab) {
      setActiveTab(firstAllowed);
    }
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Navbar onOpenLogin={() => setIsLoginOpen(true)} />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="content-body">
            <ErrorBoundary>
              {activeTab === "pos" && <POSModule />}
              {activeTab === "master" && <ProductMaster />}
              {activeTab === "inventory" && <InventoryModule />}
              {activeTab === "reports" && <ReportsModule />}
              {activeTab === "settings" && <SettingsModule />}
            </ErrorBoundary>
          </main>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <MainContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
