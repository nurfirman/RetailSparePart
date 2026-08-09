import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Download,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";

export function ReportsModule() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const stockMovements = useLiveQuery(() => db.stock_movements.toArray(), []) || [];

  // Financial Metrics Calculation
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
  const totalTrxCount = transactions.length;
  const avgBasketSize = totalTrxCount > 0 ? Math.round(totalRevenue / totalTrxCount) : 0;

  // Gross Profit calculation (Sales price - HPP cost price)
  let totalCost = 0;
  transactions.forEach((t) => {
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const cost = prod ? prod.cost_price : item.unit_price * 0.7; // fallback
        totalCost += cost * item.quantity;
      });
    }
  });
  const grossProfit = Math.max(0, totalRevenue - totalCost);

  // Prepare Daily Sales Bar Chart Data
  const salesByDate = {};
  transactions.forEach((t) => {
    const dateStr = new Date(t.created_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
    salesByDate[dateStr] = (salesByDate[dateStr] || 0) + t.total_amount;
  });

  const chartData = Object.keys(salesByDate).map((date) => ({
    date,
    Omset: salesByDate[date],
  }));

  // Consignment Items Report
  const consignmentProducts = products.filter((p) => p.is_consignment);

  // Low Stock Items Alert List
  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.min_stock_alert);

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Invoice,Tanggal,Pelanggan,Metode,Total (Rp)\n";

    transactions.forEach((t) => {
      csvContent += `${t.invoice_number},${new Date(t.created_at).toLocaleDateString("id-ID")},"${t.customer_name}",${t.payment_method},${t.total_amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_Sparepart_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header & Export Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Laporan Finansial &amp; Analitik
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Ringkasan Omset, Profit Kotor, Laporan Konsinyasi &amp; Peringatan Stok
          </p>
        </div>

        <button className="btn btn-emerald" onClick={handleExportCSV}>
          <FileSpreadsheet size={18} /> Export Laporan CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--emerald-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <DollarSign color="var(--emerald)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL OMSET PENJUALAN</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--emerald)" }}>
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <TrendingUp color="var(--primary)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>ESTIMASI PROFIT KOTOR</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
              Rp {grossProfit.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--purple-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <ShoppingBag color="var(--purple)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL STRUK / TRANSAKSI</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--purple)" }}>
              {totalTrxCount} Transaksi
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--amber-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <BarChart3 color="var(--amber)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>RATA-RATA STRUK (BASKET)</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--amber)" }}>
              Rp {avgBasketSize.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Chart & Low Stock Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }}>
        {/* Recharts Bar Chart */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--text-primary)" }}>
            Grafik Penjualan Harian (Omset Rp)
          </h3>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length > 0 ? chartData : [{ date: "Hari ini", Omset: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26334d" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#151c2c", borderColor: "#26334d", borderRadius: "8px" }}
                  formatter={(val) => [`Rp ${Number(val).toLocaleString("id-ID")}`, "Omset"]}
                />
                <Bar dataKey="Omset" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning List Card */}
        <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--rose)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} /> Alert Stok Kritis / Re-order ({lowStockProducts.length})
          </h3>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                Semua stok sparepart berada dalam kondisi aman!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "var(--bg-main)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      SKU: {p.sku_number} • Rak: {p.bin_location || "Rak A-01"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span className={`badge ${p.stock_quantity === 0 ? "badge-rose" : "badge-amber"}`}>
                      Sisa: {p.stock_quantity} unit (Min: {p.min_stock_alert})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Consignment Items Breakdown */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={18} color="var(--purple)" /> Rekapitulasi Produk Konsinyasi (Barang Titipan Supplier)
          </h3>
          <span className="badge badge-purple">{consignmentProducts.length} Item SKU Konsinyasi</span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>SKU / Sparepart</th>
              <th>OEM Part</th>
              <th>Kompatibilitas</th>
              <th>Stok Fisik Saat Ini</th>
              <th>Harga Jual Retail</th>
              <th>HPP Pokok (Setoran Supplier)</th>
            </tr>
          </thead>
          <tbody>
            {consignmentProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  Belum ada produk titipan konsinyasi.
                </td>
              </tr>
            ) : (
              consignmentProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SKU: {p.sku_number}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{p.oem_number || "-"}</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{p.vehicle_compatibility}</td>
                  <td>
                    <span className="badge badge-emerald">{p.stock_quantity} Pcs</span>
                  </td>
                  <td>Rp {p.selling_price.toLocaleString("id-ID")}</td>
                  <td style={{ fontWeight: 700, color: "var(--purple)" }}>Rp {p.cost_price.toLocaleString("id-ID")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
