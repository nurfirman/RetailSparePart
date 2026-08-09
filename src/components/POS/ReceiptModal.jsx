import React from "react";
import { Printer, Download, Share2, CheckCircle2, X } from "lucide-react";
import confetti from "canvas-confetti";

export function ReceiptModal({ isOpen, onClose, transaction, onNewTransaction }) {
  if (!isOpen || !transaction) return null;

  // Trigger confetti on successful receipt modal open
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  } catch (e) {}

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*FAKTUR STRUK OTO SPAREPART*\nNo: ${transaction.invoice_number}\nTanggal: ${new Date(transaction.created_at).toLocaleString("id-ID")}\nTotal: Rp ${transaction.total_amount.toLocaleString("id-ID")}\nTerima kasih telah berbelanja!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 color="var(--emerald)" size={22} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Transaksi Berhasil!</h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ background: "#f8fafc", color: "#0f172a", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
          {/* Printable Thermal Receipt Area */}
          <div id="thermal-receipt" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: "1.4" }}>
            <div style={{ textAlign: "center", marginBottom: "1rem", borderBottom: "1px dashed #94a3b8", paddingBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 2px 0" }}>OTO SPAREPART RETAIL</h2>
              <div style={{ fontSize: "10px", color: "#475569" }}>Jl. Raya Otomotif No. 128, Jakarta</div>
              <div style={{ fontSize: "10px", color: "#475569" }}>Telp / WA: 0812-3456-7890</div>
            </div>

            <div style={{ fontSize: "11px", marginBottom: "0.75rem", borderBottom: "1px dashed #94a3b8", paddingBottom: "0.5rem" }}>
              <div><strong>No Invoice:</strong> {transaction.invoice_number}</div>
              <div><strong>Tanggal:</strong> {new Date(transaction.created_at).toLocaleString("id-ID")}</div>
              <div><strong>Kasir:</strong> {transaction.cashier_name || "Siti Rahma"}</div>
              <div><strong>Pelanggan:</strong> {transaction.customer_name || "Pelanggan Umum"}</div>
            </div>

            {/* Line Items */}
            <div style={{ borderBottom: "1px dashed #94a3b8", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
              {transaction.items.map((item, idx) => (
                <div key={idx} style={{ marginBottom: "0.4rem" }}>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  {item.oem_number && <div style={{ fontSize: "9px", color: "#64748b" }}>OEM: {item.oem_number}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{item.quantity} x Rp {item.unit_price.toLocaleString("id-ID")}</span>
                    <span>Rp {item.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div style={{ borderBottom: "1px dashed #94a3b8", paddingBottom: "0.5rem", marginBottom: "0.75rem" }}>
              {transaction.discount_amount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Diskon Trx:</span>
                  <span>- Rp {transaction.discount_amount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px" }}>
                <span>TOTAL HARGA:</span>
                <span>Rp {transaction.total_amount.toLocaleString("id-ID")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                <span>Metode Bayar:</span>
                <span><strong>{transaction.payment_method}</strong></span>
              </div>
              {transaction.payment_method === "CASH" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Tunai Dibayar:</span>
                    <span>Rp {(transaction.amount_paid || transaction.total_amount).toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#047857" }}>
                    <span>Kembalian:</span>
                    <span>Rp {(transaction.change_amount || 0).toLocaleString("id-ID")}</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ textAlign: "center", fontSize: "10px", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              *** Terima Kasih atas Kunjungan Anda ***<br />
              Barang yang sudah dibeli tidak dapat ditukar/dikembalikan tanpa struk ini.
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", width: "100%", gap: "0.5rem" }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
              <Printer size={16} /> Cetak Struk
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleShareWhatsApp}>
              <Share2 size={16} /> WA Struk
            </button>
          </div>
          <button
            className="btn btn-emerald btn-lg"
            style={{ width: "100%" }}
            onClick={() => {
              onNewTransaction();
              onClose();
            }}
          >
            Transaksi Baru (Selesai)
          </button>
        </div>
      </div>
    </div>
  );
}
