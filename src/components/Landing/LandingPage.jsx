import React, { useState } from "react";
import {
  Wrench,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  Package,
  Boxes,
  TrendingUp,
  Database,
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Building2,
  Lock,
  Cpu,
  RefreshCw,
  LayoutDashboard
} from "lucide-react";
import "./LandingPage.css";

export function LandingPage({ onOpenAuth, onGoToDashboard, currentUser }) {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="landing-container">
      {/* 1. Header Navigation */}
      <nav className="landing-navbar">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Wrench size={24} color="#ffffff" />
            </div>
            <span>AutoPart <span style={{ color: "#38bdf8" }}>Pro</span></span>
          </div>

          <div className="landing-nav-links">
            <a href="#features">Fitur Unggulan</a>
            <a href="#problems">Solusi</a>
            <a href="#pricing">Harga</a>
            <a href="#faq">FAQ</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {currentUser ? (
              <button
                className="landing-btn-primary"
                onClick={onGoToDashboard}
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              >
                <LayoutDashboard size={18} /> Buka Dashboard POS ({currentUser.name})
              </button>
            ) : (
              <>
                <button
                  className="landing-btn-secondary"
                  onClick={() => onOpenAuth("login")}
                >
                  Masuk
                </button>
                <button
                  className="landing-btn-primary"
                  onClick={() => onOpenAuth("register")}
                >
                  Daftar Gratis <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-glow"></div>
        <div className="landing-badge">
          <Sparkles size={14} /> Software POS & Inventaris Sparepart Otomotif #1 Indonesia
        </div>

        <h1 className="landing-hero-title">
          Kelola Ribuan Sparepart & Bengkel <br />
          <span>Tanpa Pusing Stok Hilang & OEM Rumit</span>
        </h1>

        <p className="landing-hero-subtitle">
          Sistem POS modern khusus toko sparepart mobil & motor. Pencarian nomor OEM instan,
          manajemen konsinyasi supplier, multi-gudang, dan kasir cepat yang dapat bekerja tanpa koneksi internet (Offline-First).
        </p>

        <div className="landing-hero-ctas">
          {currentUser ? (
            <button className="landing-btn-primary" onClick={onGoToDashboard} style={{ fontSize: "1.1rem", padding: "0.9rem 2rem" }}>
              <LayoutDashboard size={20} /> Ke Dashboard POS Sekarang
            </button>
          ) : (
            <>
              <button className="landing-btn-primary" onClick={() => onOpenAuth("register")} style={{ fontSize: "1.05rem", padding: "0.85rem 1.85rem" }}>
                <Zap size={18} /> Coba Gratis 14 Hari (Tanpa Kartu Kredit)
              </button>
              <button className="landing-btn-secondary" onClick={() => onOpenAuth("login")} style={{ fontSize: "1.05rem", padding: "0.85rem 1.75rem" }}>
                <Lock size={18} /> Quick Demo Login 1-Click
              </button>
            </>
          )}
        </div>

        {/* Live Mockup Preview */}
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            borderRadius: "20px",
            padding: "10px",
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.15))",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              background: "#111827",
              borderRadius: "14px",
              padding: "1.5rem",
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#f59e0b" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981" }}></div>
                <span style={{ fontSize: "0.85rem", color: "#6b7280", marginLeft: "0.5rem", fontWeight: 600 }}>AutoPart Pro POS Workspace v2.4</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "0.25rem 0.75rem", borderRadius: "999px" }}>
                <RefreshCw size={12} className="spin" /> Offline-First Sync Active (Neon Postgres Connected)
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
              <div style={{ background: "rgba(31, 41, 55, 0.6)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ flex: 1, background: "#1f2937", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid #374151", color: "#9ca3af", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <Search size={16} /> Cari Nomor OEM: "45022-S0A-000" atau Busi Iridium...
                  </div>
                  <button style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0 1.25rem", borderRadius: "8px", fontWeight: 600, fontSize: "0.85rem" }}>Cari</button>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.5rem", fontWeight: 600 }}>Hasil Pencarian Cepat OEM:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: "rgba(55, 65, 81, 0.4)", borderRadius: "6px" }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>Brake Pad Front Honda CRV Gen 2</div>
                      <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>OEM: 45022-S0A-000 | Rak A-04</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.9rem" }}>Rp 385.000</div>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Stok: 14 pcs</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.8rem", background: "rgba(55, 65, 81, 0.4)", borderRadius: "6px" }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>Filter Oli Avanza / Xenia Original</div>
                      <div style={{ fontSize: "0.75rem", color: "#38bdf8" }}>OEM: 15601-BZ010 | Rak B-12</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#34d399", fontWeight: 700, fontSize: "0.9rem" }}>Rp 32.000</div>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Stok: 48 pcs</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(31, 41, 55, 0.8)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.3)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem", marginBottom: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                    <span>Keranjang Transaksi</span>
                    <span style={{ color: "#38bdf8" }}>#INV-9823</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span>Subtotal (2 Item):</span>
                    <span>Rp 417.000</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span>PPN (11%):</span>
                    <span>Rp 45.870</span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.5rem", marginTop: "0.5rem", fontWeight: 800, fontSize: "1.1rem", color: "#34d399", display: "flex", justifyContent: "space-between" }}>
                    <span>Total Bayar:</span>
                    <span>Rp 462.870</span>
                  </div>
                </div>
                <button style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", padding: "0.75rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", width: "100%", marginTop: "1rem" }}>
                  Bayar / Cetak Struk (F12)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof Stats */}
      <section className="landing-stats-banner">
        <div className="landing-stats-grid">
          <div>
            <div className="landing-stat-number">1,200+</div>
            <div className="landing-stat-label">Toko Sparepart & Bengkel Aktif</div>
          </div>
          <div>
            <div className="landing-stat-number">Rp 45B+</div>
            <div className="landing-stat-label">Total Transaksi Diproses</div>
          </div>
          <div>
            <div className="landing-stat-number">300,000+</div>
            <div className="landing-stat-label">Database Kode OEM & SKU</div>
          </div>
          <div>
            <div className="landing-stat-number">99.99%</div>
            <div className="landing-stat-label">Keandalan Offline & Cloud Sync</div>
          </div>
        </div>
      </section>

      {/* 4. Problem & Solution Section (PAS Framework) */}
      <section id="problems" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-badge" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}>
            Masalah Utama Toko Sparepart
          </div>
          <h2 className="landing-section-title">
            Mengapa Manajemen Sparepart Tradisional Selalu Menyita Waktu & Rugi Stok?
          </h2>
          <p className="landing-section-desc">
            Sparepart otomotif sangat spesifik. Kesalahan 1 digit nomor OEM atau barang konsinyasi supplier yang tidak tercatat bisa berujung kerugian jutaan rupiah.
          </p>
        </div>

        <div className="landing-grid-3">
          <div className="landing-glass-card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <div className="landing-card-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }}>
              Sulit Mengingat Nomor OEM & Tipe Mobil
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.925rem", lineHeight: 1.6 }}>
              Busi atau kampas rem terlihat sama tetapi beda tipe mobil. Pembeli sering kecewa karena barang salah dan harus retur berkali-kali.
            </p>
          </div>

          <div className="landing-glass-card" style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
            <div className="landing-card-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", borderColor: "rgba(245, 158, 11, 0.3)" }}>
              <Boxes size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }}>
              Stok Konsinyasi & Supplier Berantakan
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.925rem", lineHeight: 1.6 }}>
              Mana barang milik supplier konsinyasi dan mana barang stok milik toko? Laporan pembagian hasil menjadi kacau saat penagihan.
            </p>
          </div>

          <div className="landing-glass-card" style={{ borderColor: "rgba(168, 85, 247, 0.2)" }}>
            <div className="landing-card-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.3)" }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", color: "#fff" }}>
              Mati Listrik / Internet Lemot Kasir Terhenti
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.925rem", lineHeight: 1.6 }}>
              Aplikasi berbasis cloud murni sering macet ketika koneksi internet terputus. Antrean kasir menumpuk dan pelanggan pergi.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Features Section (AIDA Framework) */}
      <section id="features" className="landing-section" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="landing-section-header">
          <div className="landing-badge">Solusi Kelas Dunia</div>
          <h2 className="landing-section-title">
            Fitur Yang Didesain Khusus Untuk Kecepatan Kasir & Akurasi Gudang
          </h2>
          <p className="landing-section-desc">
            Solusi komprehensif dari pendaftaran akun cepat hingga pencetakan struk dan analitik margin keuntungan per item.
          </p>
        </div>

        <div className="landing-grid-3">
          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Pencarian Cepat OEM & Barcode
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Cari berdasarkan SKU, Nomor OEM, merek (Honda, Toyota, Yamaha, dll), atau posisi rak gudang secara instan dalam hitungan milidetik.
            </p>
          </div>

          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <Package size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Stok Konsinyasi & Supplier Tracking
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Kelola barang titipan supplier dengan pemisahan otomatis barang konsinyasi vs stok beli putus untuk perhitungan bagi hasil akurat.
            </p>
          </div>

          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Hybrid Offline-First (Dexie & Neon DB)
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Aplikasi tetap berjalan 100% meski internet mati total. Data transaksi tersimpan otomatis di komputer lokal & tersinkronisasi ke Cloud.
            </p>
          </div>

          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Keamanan Akun Email & Password
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Autentikasi tingkat tinggi dengan enkripsi kata sandi (SHA-256/PBKDF2), proteksi peran (Owner, Petugas Gudang, Kasir), dan validasi email.
            </p>
          </div>

          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Laporan Profit Real-Time
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Ketahui produk sparepart mana yang beromzet paling tinggi, margin keuntungan kotor per item, dan estimasi waktu re-stock barang.
            </p>
          </div>

          <div className="landing-glass-card">
            <div className="landing-card-icon">
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem", color: "#fff" }}>
              Multi-Pengguna & Role-Based Access
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Atur hak akses kasir agar tidak bisa mengubah harga jual atau melihat laporan keuangan owner tanpa izin resmi.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-badge">Harga Transparan</div>
          <h2 className="landing-section-title">Paket Berlangganan Tanpa Biaya Tersembunyi</h2>
          <p className="landing-section-desc">Pilih paket yang paling sesuai dengan skala usaha toko sparepart atau bengkel Anda.</p>
        </div>

        <div className="landing-grid-3">
          {/* Plan 1 */}
          <div className="landing-pricing-card">
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>Starter Bengkel</h3>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>Cocok untuk bengkel kecil / toko sparepart tunggal</p>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#fff", marginBottom: "1.5rem" }}>
              Rp 149.000 <span style={{ fontSize: "0.875rem", color: "#9ca3af", fontWeight: 400 }}>/ bulan</span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0, margin: "0 0 2rem 0", fontSize: "0.9rem", color: "#d1d5db" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Hingga 2 Kasir / User</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> 5,000 Produk Sparepart</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Pencarian OEM & Barcode</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Offline Database (IndexedDB)</li>
            </ul>
            <button className="landing-btn-secondary" style={{ marginTop: "auto", width: "100%", justifyContent: "center" }} onClick={() => onOpenAuth("register")}>
              Pilih Paket Starter
            </button>
          </div>

          {/* Plan 2 - Featured */}
          <div className="landing-pricing-card landing-pricing-featured">
            <div className="landing-pricing-badge">Paling Populer</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>Professional Pro</h3>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>Untuk toko sparepart besar & jaringan bengkel</p>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#38bdf8", marginBottom: "1.5rem" }}>
              Rp 299.000 <span style={{ fontSize: "0.875rem", color: "#9ca3af", fontWeight: 400 }}>/ bulan</span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0, margin: "0 0 2rem 0", fontSize: "0.9rem", color: "#d1d5db" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#38bdf8" /> Unlimited User & Shift Kasir</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#38bdf8" /> Unlimited Produk Sparepart & OEM</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#38bdf8" /> Manajemen Stok Konsinyasi Supplier</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#38bdf8" /> Cloud Sync Neon Postgres Automatic</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#38bdf8" /> Laporan Laba Rugi & Margin Item</li>
            </ul>
            <button className="landing-btn-primary" style={{ marginTop: "auto", width: "100%", justifyContent: "center" }} onClick={() => onOpenAuth("register")}>
              Mulai Uji Coba Gratis
            </button>
          </div>

          {/* Plan 3 */}
          <div className="landing-pricing-card">
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>Enterprise Fleet</h3>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>Grosir sparepart, distributor & banyak cabang gudang</p>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#fff", marginBottom: "1.5rem" }}>
              Hubungi Kami
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0, margin: "0 0 2rem 0", fontSize: "0.9rem", color: "#d1d5db" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Fitur Multi-Cabang / Multi-Gudang</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> API & Integrasi ERP Custom</li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><CheckCircle2 size={16} color="#10b981" /> Dedicated Account Manager & SLA 99.99%</li>
            </ul>
            <button className="landing-btn-secondary" style={{ marginTop: "auto", width: "100%", justifyContent: "center" }} onClick={() => onOpenAuth("register")}>
              Hubungi Tim Sales
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="landing-section" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="landing-section-header">
          <div className="landing-badge">Pertanyaan Umum</div>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <p className="landing-section-desc">Segala hal yang perlu Anda ketahui mengenai aplikasi AutoPart Pro.</p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {[
            {
              q: "Apakah aplikasi ini bisa digunakan saat internet mati?",
              a: "Ya! AutoPart Pro menggunakan arsitektur Hybrid Offline-First berbasis Dexie IndexedDB lokal. Transaksi kasir, cetak struk, dan cek stok dapat berjalan normal tanpa internet, dan akan otomatis tersinkron ke cloud begitu internet terhubung."
            },
            {
              q: "Bagaimana cara mendaftar akun baru dengan email dan password?",
              a: "Klik tombol 'Daftar Gratis' di bagian kanan atas. Masukkan nama lengkap, email terdaftar, buat kata sandi aman (minimal 8 karakter), dan pilih peran akun Anda. Akun Anda langsung aktif seketika."
            },
            {
              q: "Apakah aman menyimpan data sparepart dan keuangan di AutoPart Pro?",
              a: "Sangat aman. Kata sandi dienkripsi dengan standar enkripsi SHA-256 dengan garam unik (salt). Data Anda disimpan secara terisolasi di database lokal & Cloud Postgres terenkripsi."
            },
            {
              q: "Apakah saya bisa memisahkan barang konsinyasi supplier dengan barang toko?",
              a: "Tentu. AutoPart Pro memiliki modul Manajemen Konsinyasi khusus yang mencatat supplier pemilik barang, persentase bagi hasil, serta stok tersisa untuk mempermudah pembayaran penagihan."
            }
          ].map((item, idx) => (
            <div key={idx} className="landing-faq-item">
              <button className="landing-faq-question" onClick={() => toggleFaq(idx)}>
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} color="#9ca3af" />}
              </button>
              {openFaq === idx && <div className="landing-faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section style={{ padding: "5rem 2rem", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "1rem", color: "#fff" }}>
            Siap Modernisasi Toko Sparepart & Bengkel Anda?
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Bergabunglah dengan ribuan pemilik usaha sparepart yang telah menghemat waktu dan meningkatkan profit hingga 35%.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            {currentUser ? (
              <button className="landing-btn-primary" onClick={onGoToDashboard} style={{ fontSize: "1.1rem", padding: "0.9rem 2.25rem" }}>
                <LayoutDashboard size={20} /> Masuk Ke POS Dashboard
              </button>
            ) : (
              <button className="landing-btn-primary" onClick={() => onOpenAuth("register")} style={{ fontSize: "1.1rem", padding: "0.9rem 2.25rem" }}>
                <Zap size={20} /> Daftar Akun Sekarang - Gratis
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="landing-footer">
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div className="landing-logo-icon" style={{ width: "32px", height: "32px" }}>
              <Wrench size={18} color="#ffffff" />
            </div>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.1rem" }}>AutoPart Pro POS</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            © {new Date().getFullYear()} AutoPart Pro RetailSparePart Inc. All rights reserved. World-Class POS Solution.
          </div>
        </div>
      </footer>
    </div>
  );
}
