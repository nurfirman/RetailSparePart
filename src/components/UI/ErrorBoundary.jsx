import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "var(--bg-main)",
            color: "var(--text-primary)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-lg)",
              background: "var(--rose-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
            }}
          >
            <AlertTriangle size={32} color="var(--rose)" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Terjadi Kesalahan Sistem
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: "500px" }}>
            Modul mengalami error. Klik tombol di bawah untuk mencoba memuat ulang, atau refresh halaman browser.
          </p>
          <div style={{ 
            background: "var(--bg-card)", 
            border: "1px solid var(--border)", 
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            fontSize: "0.8rem",
            color: "var(--rose)",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "1.5rem",
            maxWidth: "600px",
            overflowX: "auto",
          }}>
            {this.state.error?.message || "Unknown error"}
          </div>
          <button className="btn btn-primary" onClick={this.handleReset}>
            <RotateCcw size={16} /> Muat Ulang Modul
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
