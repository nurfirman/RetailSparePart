import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { useToast } from "../UI/ToastProvider";
import {
  History,
  Search,
  Printer,
  ShoppingCart,
  Calendar,
  CreditCard,
  User,
  X,
  ChevronRight,
  Eye,
  ArrowRightLeft,
  FileText,
} from "lucide-react";

export function TransactionHistoryModal({
  isOpen,
  onClose,
  onViewReceipt,
  onRecallToCart,
}) {
  const toast = useToast();
  const transactions = useLiveQuery(() => db.transactions.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState(null);

  if (!isOpen) return null;

  // Filter and sort transactions (newest first)
  const filteredTransactions = transactions
    .filter((t) => {
      const matchSearch =
        (t.invoice_number && t.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.cashier_name && t.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPayment = paymentFilter === "all" || t.payment_method === paymentFilter;

      return matchSearch && matchPayment;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleRecallItems = (t) => {
    if (!t.items || t.items.length === 0) {
      toast.warning("Transaksi ini tidak memiliki rincian barang.");
      return;
    }
    // Map items to cart structure
    const cartItems = t.items.map((item) => ({
      id: item.product_id,
      name: item.name,
      oem_number: item.oem_number || "",
      selling_price: item.unit_price,
      quantity: item.quantity,
      itemDiscount: (item.unit_price * item.quantity) - item.subtotal,
    }));

    onRecallToCart(cartItems, t.customer_name || "Pelanggan Umum");
    toast.success(`Transaksi ${t.invoice_number} berhasil dimuat kembali ke Keranjang POS!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "800px", height: "85vh" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History color="var(--primary)" size={22} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Riwayat Transaksi POS ({transactions.length})
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Cari, cetak ulang struk, atau panggil kembali barang ke keranjang
              </span>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-input)", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: "2.2rem", fontSize: "0.85rem" }}
              placeholder="Cari No. Invoice, Pelanggan, atau Kasir..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            style={{ width: "160px", flexShrink: 0, fontSize: "0.85rem" }}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">Semua Metode</option>
            <option value="CASH">Cash / Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Bank Transfer</option>
            <option value="CARD">Kartu Debit/Kredit</option>
          </select>
        </div>

        {/* Main List */}
        <div className="modal-body" style={{ display: "flex", gap: "1rem", overflow: "hidden", padding: "1rem", flexWrap: "wrap" }}>
          {/* Left: Transaction Cards List */}
          <div style={{ flex: "1 1 280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem", paddingRight: "0.25rem", minHeight: "220px" }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <FileText size={36} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
                <div>Belum ada riwayat transaksi yang sesuai.</div>
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const isSelected = selectedTx?.id === t.id;
                const itemCount = t.items ? t.items.reduce((s, i) => s + i.quantity, 0) : 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTx(t)}
                    style={{
                      background: isSelected ? "var(--primary-light)" : "var(--bg-main)",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      transition: "var(--transition)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>
                          {t.invoice_number}
                        </span>
                        <span className="badge badge-emerald" style={{ fontSize: "0.65rem" }}>
                          {t.payment_method}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        <Calendar size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {new Date(t.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" • "}
                        <User size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {t.customer_name || "Pelanggan Umum"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--emerald)" }}>
                        Rp {(t.total_amount || 0).toLocaleString("id-ID")}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {itemCount} pcs barang
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Selected Transaction Preview Detail & Quick Actions */}
          <div
            style={{
              flex: "1 1 280px",
              background: "var(--bg-main)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: "240px",
            }}
          >
            {selectedTx ? (
              <>
                <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", background: "var(--bg-card)" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Detail Transaksi</div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--primary)" }}>{selectedTx.invoice_number}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Pelanggan: {selectedTx.customer_name}</div>
                </div>

                {/* Items Breakdown */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                    DAFTAR ITEM BELANJA:
                  </div>
                  {selectedTx.items && selectedTx.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg-card)",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                          {item.quantity} x Rp {(item.unit_price || 0).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--emerald)" }}>
                        Rp {(item.subtotal || 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Action Buttons */}
                <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", background: "var(--bg-card)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 800 }}>
                    <span>TOTAL:</span>
                    <span style={{ color: "var(--emerald)" }}>Rp {(selectedTx.total_amount || 0).toLocaleString("id-ID")}</span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        onViewReceipt(selectedTx);
                      }}
                      title="Lihat / Cetak Ulang Struk Faktur"
                    >
                      <Printer size={14} /> Cetak Struk
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleRecallItems(selectedTx)}
                      title="Muat barang ke Keranjang POS untuk order lagi"
                    >
                      <ShoppingCart size={14} /> Ke Cart
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", margin: "auto", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Pilih salah satu transaksi dari daftar sebelah kiri untuk melihat rincian &amp; panggil ulang.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
