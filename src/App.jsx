import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", color: "var(--text-primary)" }}>
        <div>Memuat Sistem Sparepart POS...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Navbar />

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="content-body">
            {activeTab === "pos" && <POSModule />}
            {activeTab === "master" && <ProductMaster />}
            {activeTab === "inventory" && <InventoryModule />}
            {activeTab === "reports" && <ReportsModule />}
            {activeTab === "settings" && <SettingsModule />}
          </main>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
