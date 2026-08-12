# 🔍 Laporan Audit Menyeluruh — OtoSparePart POS & Inventory
> Perspektif: Auditor Independen & CTO Due Diligence
> Tanggal Audit: 10 Agustus 2026

---

## 1. 📋 Ringkasan Pemahaman Project

**OtoSparePart POS & Inventory** adalah aplikasi manajemen toko sparepart kendaraan (motor & mobil) berbasis web yang dirancang untuk UMKM bengkel/toko suku cadang Indonesia. Aplikasi ini dibangun dengan **React 19 + Vite**, menggunakan arsitektur **offline-first** dengan IndexedDB (Dexie.js) sebagai penyimpanan lokal, dan **Neon Postgres Serverless** sebagai cloud backup/sync.

**Stack Teknologi:**
- Frontend: React 19, Vite 8
- State & Data: Dexie.js (IndexedDB), dexie-react-hooks
- Cloud DB: Neon Postgres Serverless (@neondatabase/serverless)
- Legacy Cloud: Supabase (masih ada dependency)
- Charts: Recharts
- Icons: Lucide React
- Styling: Vanilla CSS + CSS Variables (dark mode)

**Target Pengguna:** Pemilik toko / bengkel sparepart skala kecil-menengah dengan 3 level role: Owner/Admin, Petugas Gudang, dan Kasir POS.

---

## 2. ✅ Daftar Fitur Yang Sudah Tersedia

| Modul | Fitur | Status |
|---|---|---|
| **POS** | Tampil katalog produk dengan search & filter | ✅ Ada |
| **POS** | Filter per kategori (pill tabs) | ✅ Ada |
| **POS** | Filter per kompatibilitas kendaraan | ✅ Ada (hardcoded) |
| **POS** | Keranjang belanja interaktif | ✅ Ada |
| **POS** | Diskon per item & diskon global per transaksi | ✅ Ada |
| **POS** | 4 metode pembayaran: Cash, QRIS, Transfer, Kartu | ✅ Ada |
| **POS** | Perhitungan kembalian otomatis | ✅ Ada |
| **POS** | Hold/Tunda transaksi & resume | ✅ Ada |
| **POS** | Struk/Receipt modal setelah checkout | ✅ Ada |
| **POS** | Simulasi scan barcode | ⚠️ Simulasi saja |
| **Master Data** | CRUD produk (SKU, OEM, kompatibilitas, harga, bin location) | ✅ Ada |
| **Master Data** | Manajemen kategori produk | ✅ Ada |
| **Master Data** | Filter & search produk | ✅ Ada |
| **Master Data** | Flag produk konsinyasi | ✅ Ada |
| **Inventory** | Pencatatan barang masuk manual | ✅ Ada |
| **Inventory** | Pencatatan barang masuk konsinyasi | ✅ Ada |
| **Inventory** | Pencatatan barang keluar (rusak/hadiah) | ✅ Ada |
| **Inventory** | Purchase Order (PO) ke supplier | ✅ Ada |
| **Inventory** | Receive PO dan update stok | ✅ Ada |
| **Inventory** | Riwayat pergerakan stok | ✅ Ada |
| **Reports** | KPI: Omset, Profit Kotor, Jumlah Transaksi, Avg Basket | ✅ Ada |
| **Reports** | Grafik penjualan harian (bar chart) | ✅ Ada |
| **Reports** | Alert stok kritis / low stock | ✅ Ada |
| **Reports** | Rekapitulasi produk konsinyasi | ✅ Ada |
| **Reports** | Export CSV laporan penjualan | ✅ Ada |
| **Settings** | Konfigurasi koneksi Neon Postgres | ✅ Ada |
| **Settings** | Test koneksi cloud | ✅ Ada |
| **Settings** | Sinkronisasi manual ke Neon | ✅ Ada |
| **Settings** | Statistik local IndexedDB | ✅ Ada |
| **Settings** | Reset & re-seed data dummy | ✅ Ada |
| **Auth** | Multi-user dengan 3 role | ✅ Ada |
| **Auth** | Login modal dengan email | ✅ Ada |
| **Auth** | Quick demo 1-click login | ✅ Ada |
| **Auth** | User switcher di navbar | ✅ Ada |
| **Sync** | Offline-first dengan sync queue | ✅ Ada |
| **Sync** | Network status indicator | ✅ Ada |
| **Sync** | Pending sync count badge | ✅ Ada |

---

## 3. 🗺️ User Flow Yang Teridentifikasi

### Flow 1: Kasir (POS Operator) — Transaksi Penjualan
```
Buka App → Auto login sebagai user default → Modul POS
→ Cari produk (nama/SKU/OEM/kendaraan)
→ Klik produk → Tambah ke keranjang
→ Atur qty & diskon item → Masukkan nama pelanggan
→ Pilih metode bayar → (Cash: input jumlah bayar, lihat kembalian)
→ Klik BAYAR → Lihat receipt → Transaksi tersimpan lokal → Queue sync
```

### Flow 2: Petugas Gudang — Terima Barang Masuk
```
Switch ke akun Gudang → Modul Inventory → Tab Barang Masuk
→ Pilih produk → Pilih tipe (Manual/Konsinyasi)
→ Input qty & harga pokok → Submit
→ Stok diupdate di IndexedDB → Queue sync ke Neon
```

### Flow 3: Petugas Gudang — Purchase Order
```
Inventory → Tab PO → Buat PO Baru
→ Pilih supplier → Tambah items produk dengan qty & harga
→ Submit PO dengan status DRAFT/ORDERED
→ Receive PO → Stok otomatis bertambah
```

### Flow 4: Owner/Admin — Monitor & Laporan
```
Switch ke akun Owner → Modul Reports
→ Lihat KPI cards (Omset, Profit, Transaksi, Avg Basket)
→ Lihat grafik penjualan harian
→ Lihat produk stok kritis
→ Export CSV laporan
→ Settings → Sync ke Neon
```

### Flow 5: Sinkronisasi Cloud
```
Online → Klik Singkronkan di navbar ATAU Settings → Sinkronkan Sekarang
→ Upload PENDING items dari sync_queue ke Neon
→ Pull latest products/categories/suppliers dari Neon
```

---

## 4. 💡 Kelebihan Aplikasi

1. **Arsitektur offline-first yang solid** — Dexie.js + sync queue memungkinkan operasional tanpa internet
2. **UI dark mode yang konsisten** — Design system dengan CSS variables terorganisir
3. **Fitur domain-specific yang relevan** — OEM number, vehicle compatibility, bin location, konsinyasi — semua sesuai kebutuhan toko sparepart nyata
4. **Hold transaction** — Fitur POS profesional yang jarang ada di produk sederhana
5. **Multi-role authentication** — Pemisahan akses Owner/Gudang/Kasir sudah ada konsepnya
6. **Desain komponen modular** — Setiap modul berdiri sendiri, mudah dikembangkan
7. **Real-time UI via Dexie LiveQuery** — Perubahan stok langsung terrefleksi di UI tanpa reload

---

## 5. ⚠️ Kekurangan Aplikasi

1. **Tidak ada route-based navigation** — Semua hanya tab state, no URL routing, no back button
2. **Authentication tidak aman sama sekali** — Login hanya cocokkan email, password sama sekali tidak divalidasi
3. **Role-based access control tidak diimplementasikan** — Kasir bisa akses Settings, Owner bisa akses semua
4. **Database credential bocor di .env** — Password Neon ada dalam plaintext di file yang commit-able
5. **Sync engine sangat fragile** — Raw SQL string building di frontend adalah SQL injection hazard
6. **Tidak ada error boundary** — Crash satu component bisa crash seluruh app
7. **Vehicle filter hardcoded** — Dropdown kendaraan di POS tidak dinamis dari data produk aktual
8. **Invoice number collision risk** — `INV-YYYYMMDD-${random 3 digit}` bisa bentrok

---

## 6. 🐛 Temuan Bug, Technical Debt & Potensi Masalah

### 🔴 Bug Kritis

| # | File | Masalah | Severity |
|---|---|---|---|
| B1 | `AuthContext.jsx:44-51` | Login hanya cocokkan email, **password tidak pernah dicek** — siapa saja yang tahu email bisa login | CRITICAL |
| B2 | `neonClient.js:11` | `import.meta.env.DATABASE_URL` tidak pernah inject oleh Vite (hanya `VITE_` prefix yang work) — variabel env ini dead code | HIGH |
| B3 | `POSModule.jsx:206` | Invoice number `INV-YYYYMMDD-${3 digit random}` — bisa collision pada volume tinggi (max 900 unique/hari) | HIGH |
| B4 | `POSModule.jsx:222` | `id: titem-${Date.now()}-${Math.random()}` — `transaction_id` di line item langsung `trx-${Date.now()}` tapi transactionData.id juga `trx-${Date.now()}`, jika timing berbeda maka foreign key akan broken | HIGH |
| B5 | `syncService.js:65` | Query builder INSERT menggunakan string interpolation — **rentan SQL injection** jika payload berisi user input berbahaya | CRITICAL |
| B6 | `ReportsModule.jsx:42` | Fallback `cost_price = item.unit_price * 0.7` — gross profit calculation inaccurate dan menyesatkan | MEDIUM |
| B7 | `Navbar.jsx:97` | Badge label "Cloud Online (Supabase)" tapi backend sudah migrasi ke Neon — **label salah/menyesatkan** | LOW |
| B8 | `offlineDb.js:15-25` | Schema IndexedDB `version(1)` — jika ada perubahan schema di masa depan tanpa increment version, data user akan corrupt | HIGH |

### 🟡 Technical Debt

| # | Masalah | Impact |
|---|---|---|
| TD1 | Dua database SDK sekaligus (`@supabase/supabase-js` + `@neondatabase/serverless`) — bundle size membengkak, dependency confusion | MEDIUM |
| TD2 | Supabase client masih ada di `services/supabaseClient.js` tapi tidak dipakai di mana pun dalam app | MEDIUM |
| TD3 | `supabase_schema.sql` ada di root project — artifact lama yang membingungkan (sudah pindah ke Neon) | LOW |
| TD4 | Inline style dipakai hampir 100% — tidak ada reusable CSS classes yang bermakna, sulit di-maintain | HIGH |
| TD5 | Tidak ada TypeScript — tidak ada type safety di seluruh codebase | MEDIUM |
| TD6 | `dummyData.js` (13KB) selalu dibundle ke production | MEDIUM |
| TD7 | Polling interval 2 detik di Navbar untuk cek sync count — resource drain yang tidak perlu | LOW |
| TD8 | Tidak ada loading state di POS saat checkout sedang diproses | MEDIUM |
| TD9 | `pullRemoteUpdates` hanya menarik products/categories/suppliers — transactions dan stock_movements tidak di-pull | HIGH |
| TD10 | `transaction_items` tidak punya table sendiri di IndexedDB — disimpan nested dalam `transactions.items` (JSON blob) tapi dikirim terpisah ke Neon — **inkonsistensi schema** | CRITICAL |

---

## 7. 🎨 Audit UI/UX

### Kekuatan
- Dark mode yang konsisten dan profesional
- Glass-card aesthetic yang modern
- Badge system dengan warna semantik (hijau=aman, merah=bahaya, kuning=warning)
- Informasi kritis (stok, harga) mudah ditemukan di POS

### Masalah UI/UX

| # | Masalah | Severity |
|---|---|---|
| UX1 | **Tidak ada konfirmasi sebelum checkout** — user bisa tidak sengaja bayar tanpa review | HIGH |
| UX2 | **`alert()` dipakai 10+ tempat** — browser native alert sangat mengganggu UX, memblokir UI, dan tidak bisa di-style | HIGH |
| UX3 | **LoginModal tidak pernah dipanggil/dibuka** — `isLoginOpen` state ada di App.jsx tapi tidak ada trigger untuk membukanya. App selalu auto-login ke user pertama. Modal login de facto tidak fungsional | CRITICAL |
| UX4 | **POS layout tidak responsif** — `gridTemplateColumns: "1fr 420px"` fixed pada mobile akan overflow | HIGH |
| UX5 | **Vehicle filter hardcoded** — daftar kendaraan static, tidak sesuai data produk aktual | MEDIUM |
| UX6 | **Tidak ada pagination di Product Grid** — jika produk banyak (500+), semua dirender sekaligus | HIGH |
| UX7 | **Sidebar tidak menunjukkan role restriction** — Kasir bisa melihat dan mengklik menu Settings | MEDIUM |
| UX8 | **Keyboard shortcut "F4" untuk checkout ditulis di UI** tapi tidak diimplementasikan | MEDIUM |
| UX9 | **Hold cart hanya alert()** — konfirmasi hold tidak informatif | LOW |
| UX10 | **Tidak ada feedback saat produk ditambahkan ke cart** — tidak ada animasi/toast, user tidak tahu apakah klik berhasil | MEDIUM |
| UX11 | **Reports tidak punya date filter** — laporan menampilkan semua data tanpa bisa filter per periode | HIGH |
| UX12 | **Loading state generik** — "Memuat Sistem Sparepart POS..." tanpa progress indicator | LOW |

---

## 8. ⚡ Audit Performa

| # | Masalah | Severity |
|---|---|---|
| P1 | `pullRemoteUpdates` melakukan `SELECT *` tanpa LIMIT pada semua produk — di skala ribuan produk ini akan **timeout/OOM** | HIGH |
| P2 | `db.products.toArray()` tanpa filter di semua modul — seluruh catalog dimuat ke memory setiap render | HIGH |
| P3 | Tidak ada virtualisasi list produk — 200+ produk dirender sebagai DOM nodes sekaligus | HIGH |
| P4 | `@supabase/supabase-js` (~150KB) diinstall tapi tidak digunakan aktif — bundle bloat sia-sia | MEDIUM |
| P5 | Polling 2 detik di Navbar (`setInterval`) untuk pending count — seharusnya pakai Dexie LiveQuery | LOW |
| P6 | `dummyData.js` (13KB) selalu ada di bundle production | LOW |
| P7 | Tidak ada React.memo / useMemo / useCallback — komponen besar seperti POSModule re-render setiap keystroke di search | MEDIUM |
| P8 | Recharts tidak lazy-loaded — diinisialisasi bahkan saat user di tab POS | LOW |
| P9 | Tidak ada code splitting / lazy loading per modul/tab | MEDIUM |

---

## 9. 🔒 Audit Keamanan

> [!CAUTION]
> Beberapa masalah di bawah ini adalah **show-stopper** untuk production deployment.

| # | Masalah | Severity |
|---|---|---|
| S1 | **Database password bocor di `.env`** — Connection string Neon dengan kredensial aktif ada di file yang berpotensi ter-commit ke Git | CRITICAL |
| S2 | **SQL injection di syncService** — Query builder menggunakan string interpolation untuk nama tabel dan kolom. Nama tabel/kolom tidak di-sanitize. | CRITICAL |
| S3 | **Password tidak pernah divalidasi saat login** — Siapapun yang tahu email user bisa login tanpa password | CRITICAL |
| S4 | **Database URL disimpan di localStorage** — Credential sensitif bisa diakses via XSS | HIGH |
| S5 | **Tidak ada RBAC enforcement** — Kasir bisa secara teknis mengakses endpoint/data apapun | HIGH |
| S6 | **RLS policy di Supabase schema** adalah `USING (true) WITH CHECK (true)` — allow all tanpa filter, ini pattern demo yang salah untuk production | HIGH |
| S7 | **Tidak ada session expiry / logout otomatis** — Session persisten di localStorage selamanya | MEDIUM |
| S8 | **Tidak ada CSP (Content Security Policy)** | MEDIUM |
| S9 | **Neon connection string dikonfigurasi dari browser** — user bisa inject URL database berbahaya melalui Settings | MEDIUM |
| S10 | **Tidak ada rate limiting di sisi client untuk request ke Neon** — bisa menghabiskan compute unit Neon | MEDIUM |

---

## 10. 🗄️ Audit Database & Arsitektur

### Skema Neon (via supabase_schema.sql)
Schema sudah cukup baik untuk domain ini:
- ✅ UUID sebagai primary key
- ✅ Tabel terpisah untuk products, transactions, transaction_items, stock_movements, purchase_orders
- ✅ Foreign key dengan ON DELETE behavior yang tepat
- ✅ Check constraints untuk enum fields

### Masalah Database

| # | Masalah | Severity |
|---|---|---|
| DB1 | **Inkonsistensi IndexedDB vs Neon schema** — `transaction_items` ada di Neon tapi tidak ada sebagai tabel di IndexedDB (disimpan nested di `transactions.items`) | CRITICAL |
| DB2 | **`sync_queue` tidak pernah di-cleanup untuk FAILED items** — items yang gagal sync tetap PENDING selamanya, tidak ada retry logic atau error state | HIGH |
| DB3 | **Tidak ada timestamp `updated_at` di tabel sync_queue** — sulit di-debug kapan item stuck | MEDIUM |
| DB4 | **`held_carts` tidak ada di Neon schema** — data hold cart hilang saat reset IndexedDB | MEDIUM |
| DB5 | **`purchase_order_items` tidak ada di IndexedDB schema** — PO items hanya disimpan di Neon tanpa local copy | HIGH |
| DB6 | **Raw SQL builder di frontend** — nama tabel ditulis hardcoded tanpa whitelist validation | CRITICAL |
| DB7 | **`pullRemoteUpdates` tidak menarik transactions** — data transaksi tidak ter-sync dari cloud ke local di device lain | HIGH |
| DB8 | **Tidak ada conflict resolution strategy** — jika dua device edit produk yang sama offline, data terakhir yang di-sync akan menimpa tanpa peringatan | HIGH |
| DB9 | **IndexedDB schema version 1 tanpa migration plan** — perubahan schema di masa depan akan break existing user data | HIGH |

### Arsitektur
```
Browser (IndexedDB Dexie) ←→ syncService.js ←→ Neon Postgres Cloud
          ↓
     React Components
     (No router, pure tab state)
```

**Masalah Arsitektur:**
- Tidak ada service layer yang memisahkan business logic dari UI
- Business logic (kalkulasi profit, invoice number) tersebar di komponen UI
- Tidak ada state management global (Redux/Zustand) — state terlalu lokal per komponen
- Tidak ada React Router — deep linking tidak mungkin

---

## 11. 📈 Audit Scalability

| # | Area | Masalah | Batas Praktis |
|---|---|---|---|
| SC1 | **Product catalog** | `db.products.toArray()` memuat semua ke memory | ~500-1000 produk sebelum lag |
| SC2 | **Sync queue** | Linear scan tanpa pagination | ~10,000 items sebelum timeout |
| SC3 | **Reports** | Kalkulasi profit looping semua transaksi di client | ~5,000 transaksi sebelum lag |
| SC4 | **Multi-device** | Tidak ada real-time sync antar device | 1 device per toko |
| SC5 | **Multi-toko** | Tidak ada tenant isolation | 1 toko saja |
| SC6 | **User management** | User hanya bisa ditambah via dummy data atau Dexie langsung | Max ~10 user praktis |

---

## 12. 🚀 Missing Feature Yang Sebaiknya Ditambahkan

| Priority | Feature | Business Value |
|---|---|---|
| 🔴 HIGH | **Real RBAC** — Blokir menu berdasarkan role | Operasional & Keamanan |
| 🔴 HIGH | **Date range filter di Reports** | Laporan akuntansi yang berguna |
| 🔴 HIGH | **Real barcode scanner** (via WebRTC/USB HID) | Efisiensi kasir |
| 🔴 HIGH | **Printer thermal receipt** (ESC/POS via WebUSB) | Operasional toko |
| 🟡 MED | **Dashboard home/overview** untuk Owner | Monitoring bisnis harian |
| 🟡 MED | **Top produk terlaris** di Reports | Business intelligence |
| 🟡 MED | **Manajemen supplier & customer master data** | Master data bisnis |
| 🟡 MED | **Return/refund transaction** | Operasional kasir |
| 🟡 MED | **Stok opname/stock take** | Audit stok fisik |
| 🟡 MED | **Notifikasi push/email stok kritis** | Proactive inventory management |
| 🟡 MED | **Multiple branch/toko** | Scale bisnis |
| 🟢 LOW | **Import produk via CSV/Excel** | Onboarding massal |
| 🟢 LOW | **Print label barcode** | Operasional gudang |
| 🟢 LOW | **Laporan pajak (PPN)** | Compliance |
| 🟢 LOW | **Mobile app (PWA)** | Mobilitas kasir |

---

## 13. 🔥 Top 10 Masalah Paling Kritis

| Rank | Masalah | Dampak |
|---|---|---|
| **#1** | ⚠️ **Kredensial database Neon bocor di .env** — sudah hardcoded, kemungkinan sudah ter-commit ke Git | Data breach, biaya Neon membengkak |
| **#2** | 🔓 **Password tidak pernah divalidasi** — login hanya cocokkan email | Siapapun bisa login tanpa password |
| **#3** | 💉 **SQL Injection di syncService.js** — nama tabel/kolom di-interpolate langsung | Data corruption/exfiltration |
| **#4** | 🚫 **LoginModal tidak pernah bisa dibuka** — trigger tidak ada di App.jsx | Fitur login de facto broken |
| **#5** | 🗄️ **Inkonsistensi schema IndexedDB vs Neon** — `transaction_items` tidak ada di IndexedDB | Data tidak pernah ter-sync dengan benar |
| **#6** | 🔄 **Sync tidak menarik transactions dari cloud** — multi-device tidak sinkron | Data hilang saat ganti device |
| **#7** | 📱 **Tidak responsif untuk mobile/tablet** — fixed grid layout | Tidak bisa dipakai di tablet kasir |
| **#8** | 🏷️ **Invoice number bisa collision** — 900 unique per hari | Duplikat invoice, laporan kacau |
| **#9** | ⛔ **Tidak ada RBAC** — Kasir bisa reset database production | Operasional risk tinggi |
| **#10** | 🔢 **Tidak ada pagination** di product grid & table | App crash/freeze di data besar |

---

## 14. ⚡ Top 10 Quick Wins (Effort Rendah, Impact Tinggi)

| Rank | Quick Win | Effort | Impact |
|---|---|---|---|
| **QW1** | **Rotate credentials Neon + tambah ke .gitignore** | 15 menit | Security critical |
| **QW2** | **Ganti semua `alert()` dengan toast notification** | 2 jam | UX drastis membaik |
| **QW3** | **Fix label "Cloud Online (Supabase)" → "Neon Postgres"** | 5 menit | Tidak menyesatkan |
| **QW4** | **Tambah trigger buka LoginModal di Navbar** | 30 menit | Fitur login jadi berfungsi |
| **QW5** | **Implement keyboard shortcut F4 untuk checkout** | 30 menit | Janji UI terpenuhi |
| **QW6** | **Hapus `@supabase/supabase-js` dari dependencies** | 15 menit | Bundle size -150KB |
| **QW7** | **Tambah Date range picker di Reports** | 3 jam | Laporan langsung berguna |
| **QW8** | **Vehicle filter dinamis dari data produk aktual** | 1 jam | Filter relevan dengan data nyata |
| **QW9** | **Tambah error boundary di App.jsx** | 1 jam | Crash terisolasi, tidak spread |
| **QW10** | **Lazy load modul (Reports, Settings, Inventory)** | 2 jam | Initial load 30-40% lebih cepat |

---

## 15. 📊 Skor Audit

| Dimensi | Skor | Catatan |
|---|---|---|
| **Product (Kelengkapan Fitur)** | **62/100** | Core POS & inventory solid, tapi banyak fitur operasional penting belum ada (return, stok opname, RBAC) |
| **UI/UX** | **55/100** | Visual menarik tapi alert() merusak experience, tidak responsif, modal login tidak berfungsi |
| **Code Quality** | **45/100** | Tidak ada TypeScript, business logic tersebar di UI, 100% inline style, naming inkonsisten |
| **Database** | **48/100** | Schema Neon cukup baik, tapi inkonsistensi dengan IndexedDB parah, sync engine rapuh |
| **Performance** | **50/100** | Offline-first bagus, tapi tidak ada virtualisasi, no memoization, SELECT * tanpa limit |
| **Security** | **18/100** | Credential bocor, no password validation, SQL injection risk — **tidak aman untuk production** |
| **Launch Readiness** | **30/100** | Belum siap production. Butuh minimal fix security, RBAC, dan sync reliability |

---

## 16. 🎯 Prioritas Perbaikan (Impact Terbesar terhadap User & Bisnis)

### Fase 1 — Security & Stability (Sebelum Apapun)
1. **Rotate Neon credentials** & pastikan `.env` di `.gitignore`
2. **Fix password validation** di AuthContext
3. **Whitelist nama tabel** di syncService untuk eliminate SQL injection
4. **Hapus Supabase dependency** yang tidak terpakai

### Fase 2 — Core Functionality Fix (Sprint 1)
5. **Fix LoginModal trigger** di App.jsx
6. **Implement RBAC** — sembunyikan/blokir menu berdasarkan role
7. **Fix inkonsistensi schema** IndexedDB vs Neon (transaction_items)
8. **Ganti semua alert() dengan toast/modal** system yang proper
9. **Fix invoice number uniqueness** (gunakan UUID atau sequence)

### Fase 3 — UX & Performance (Sprint 2)
10. **Responsive layout** untuk tablet kasir
11. **Date range filter** di Reports
12. **Virtualisasi list produk** (react-virtual atau manual windowing)
13. **Vehicle filter dinamis** dari data produk
14. **Lazy load** modul per tab

### Fase 4 — Feature Expansion (Sprint 3+)
15. **Real barcode scanner** integration
16. **Thermal printer** support (WebUSB)
17. **Return/refund** transaction flow
18. **Dashboard overview** untuk Owner
19. **Top produk terlaris** analytics
20. **Import CSV** untuk onboarding massal

---

> [!IMPORTANT]
> **Bottom Line dari CTO Perspective:**
> Aplikasi ini menunjukkan **pemahaman domain yang baik** terhadap bisnis sparepart Indonesia. Arsitektur offline-first adalah pilihan yang tepat untuk target pasar. Namun, **TIDAK SIAP untuk production** karena 3 masalah fatal: (1) credential bocor, (2) tidak ada password validation, dan (3) SQL injection risk. Selesaikan Fase 1 dalam 1-2 hari sebelum dilanjutkan. Dengan perbaikan Fase 1-2, aplikasi ini bisa launch sebagai MVP dalam 2-3 minggu.
