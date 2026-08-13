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
import { LandingPage } from "./components/Landing/LandingPage";

function MainContent() {
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("pos");
  const [viewMode, setViewMode] = useState("dashboard"); // "landing" or "dashboard"
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: "login" });

  useEffect(() => {
    initializeLocalDatabase();
  }, []);

  // If user is not logged in on initial load, show landing page as entry point
  useEffect(() => {
    if (!loading && !currentUser) {
      setViewMode("landing");
    } else if (currentUser) {
      setViewMode("dashboard");
    }
  }, [loading, currentUser]);

  const handleOpenAuth = (mode = "login") => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalState({ isOpen: false, mode: "login" });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0b0f19", color: "#f3f4f6", flexDirection: "column", gap: "1rem" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTop: "3px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Memuat Sistem AutoPart Pro POS...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 1. Show Landing Page view if selected or unauthenticated
  if (viewMode === "landing") {
    return (
      <div className="app-container" style={{ background: "#0b0f19" }}>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onGoToDashboard={() => setViewMode("dashboard")}
          currentUser={currentUser}
        />
        <LoginModal
          isOpen={authModalState.isOpen}
          onClose={handleCloseAuth}
          initialMode={authModalState.mode}
        />
      </div>
    );
  }

  // 2. Unauthenticated user trying to access dashboard directly
  if (!currentUser) {
    return (
      <div className="app-container" style={{ background: "#0b0f19" }}>
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onGoToDashboard={() => handleOpenAuth("login")}
          currentUser={currentUser}
        />
        <LoginModal
          isOpen={true}
          onClose={handleCloseAuth}
          initialMode={authModalState.mode}
        />
      </div>
    );
  }

  // 3. Authenticated POS App View
  const role = currentUser?.role || "";
  const isOwner = role === "Owner / Administrator";
  const isGudang = role === "Petugas Gudang (Inventory Admin)";
  const isKasir = role === "Kasir (POS Operator)";

  const allowedTabs = {
    pos: isOwner || isKasir,
    master: isOwner || isGudang,
    inventory: isOwner || isGudang,
    reports: isOwner || isGudang,
    settings: isOwner,
  };

  if (!allowedTabs[activeTab]) {
    const firstAllowed = Object.keys(allowedTabs).find((t) => allowedTabs[t]);
    if (firstAllowed && firstAllowed !== activeTab) {
      setActiveTab(firstAllowed);
    }
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Navbar
          onOpenLogin={(mode) => handleOpenAuth(mode)}
          onOpenLanding={() => setViewMode("landing")}
        />

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

      <LoginModal
        isOpen={authModalState.isOpen}
        onClose={handleCloseAuth}
        initialMode={authModalState.mode}
      />
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

