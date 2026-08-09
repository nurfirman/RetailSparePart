import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { queueSyncItem } from "../../services/syncService";
import { useAuth } from "../../context/AuthContext";
import { POModal } from "./POModal";
import {
  ArrowDownUp,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  Plus,
  FileText,
  AlertTriangle,
  Gift,
  CheckCircle2,
  Boxes,
  Truck,
} from "lucide-react";

export function InventoryModule() {
  const { currentUser } = useAuth();

  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];
  const purchaseOrders = useLiveQuery(() => db.purchase_orders.toArray(), []) || [];
  const stockMovements = useLiveQuery(() => db.stock_movements.toArray(), []) || [];

  const [activeSubTab, setActiveSubTab] = useState("inbound"); // "inbound" | "outbound" | "movements"

  // Inbound Form States (Direct Purchase / Consignment)
  const [inboundForm, setInboundForm] = useState({
    product_id: "",
    type: "IN_MANUAL", // "IN_MANUAL" | "IN_CONSIGNMENT"
    quantity: 10,
    unit_cost: 0,
    reference_number: "",
    notes: "",
  });

  // Outbound Form States (Damaged / Gift)
  const [outboundForm, setOutboundForm] = useState({
    product_id: "",
    type: "OUT_DAMAGED", // "OUT_DAMAGED" | "OUT_GIFT"
    quantity: 1,
    reference_number: "",
    notes: "",
  });

  // Modal State
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poToReceive, setPOToReceive] = useState(null);

  // Inbound Submission Handler
  const handleInboundSubmit = async (e) => {
    e.preventDefault();
    if (!inboundForm.product_id || inboundForm.quantity <= 0) {
      alert("Pilih produk dan masukkan kuantitas barang masuk!");
      return;
    }

    const prod = await db.products.get(inboundForm.product_id);
    if (!prod) return;

    try {
      const newStock = prod.stock_quantity + Number(inboundForm.quantity);
      const newCost = Number(inboundForm.unit_cost) > 0 ? Number(inboundForm.unit_cost) : prod.cost_price;

      // 1. Update product stock & HPP
      await db.products.update(prod.id, { stock_quantity: newStock, cost_price: newCost });
      await queueSyncItem("UPDATE", "products", { id: prod.id, stock_quantity: newStock, cost_price: newCost });

      // 2. Add Stock Movement
      const smData = {
        id: `sm-${Date.now()}`,
        product_id: prod.id,
        type: inboundForm.type,
        quantity: Number(inboundForm.quantity),
        reference_number: inboundForm.reference_number || `DIR-${Date.now()}`,
        notes: inboundForm.notes || "Penerimaan barang masuk manual",
        user_id: currentUser?.id || "usr-002",
        created_at: new Date().toISOString(),
      };
      await db.stock_movements.add(smData);
      await queueSyncItem("INSERT", "stock_movements", smData);

      alert(`Berhasil menambah stok +${inboundForm.quantity} unit untuk ${prod.name}!`);
      setInboundForm({
        product_id: "",
        type: "IN_MANUAL",
        quantity: 10,
        unit_cost: 0,
        reference_number: "",
        notes: "",
      });
    } catch (err) {
      alert(`Gagal memproses barang masuk: ${err.message}`);
    }
  };

  // Outbound Submission Handler
  const handleOutboundSubmit = async (e) => {
    e.preventDefault();
    if (!outboundForm.product_id || outboundForm.quantity <= 0) {
      alert("Pilih produk dan kuantitas barang keluar!");
      return;
    }

    const prod = await db.products.get(outboundForm.product_id);
    if (!prod) return;

    if (prod.stock_quantity < Number(outboundForm.quantity)) {
      alert(`Stok tersedia (${prod.stock_quantity}) kurang dari pengeluaran (${outboundForm.quantity})!`);
      return;
    }

    try {
      const newStock = prod.stock_quantity - Number(outboundForm.quantity);

      // 1. Update product stock
      await db.products.update(prod.id, { stock_quantity: newStock });
      await queueSyncItem("UPDATE", "products", { id: prod.id, stock_quantity: newStock });

      // 2. Log Stock Movement
      const smData = {
        id: `sm-${Date.now()}`,
        product_id: prod.id,
        type: outboundForm.type,
        quantity: Number(outboundForm.quantity),
        reference_number: outboundForm.reference_number || `ADJ-${Date.now()}`,
        notes: outboundForm.notes || (outboundForm.type === "OUT_DAMAGED" ? "Barang rusak / cacat" : "Promosi / Sampel mekanik"),
        user_id: currentUser?.id || "usr-002",
        created_at: new Date().toISOString(),
      };
      await db.stock_movements.add(smData);
      await queueSyncItem("INSERT", "stock_movements", smData);

      alert(`Pencatatan barang keluar berhasil disimpan! Stok berkurang -${outboundForm.quantity} unit.`);
      setOutboundForm({
        product_id: "",
        type: "OUT_DAMAGED",
        quantity: 1,
        reference_number: "",
        notes: "",
      });
    } catch (err) {
      alert(`Gagal memproses pengeluaran stok: ${err.message}`);
    }
  };

  // Sorted Stock Movements History Log
  const sortedMovements = [...stockMovements].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header & Sub-tab Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Manajemen Inventaris (Inbound &amp; Outbound)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Pencatatan Barang Masuk, Purchase Order (PO), Barang Rusak &amp; Audit Log Mutasi
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", background: "var(--bg-card)", padding: "0.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <button
            className={`btn btn-sm ${activeSubTab === "inbound" ? "btn-emerald" : "btn-outline"}`}
            onClick={() => setActiveSubTab("inbound")}
          >
            <ArrowDownCircle size={16} /> Barang Masuk (Inbound)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "outbound" ? "btn-rose" : "btn-outline"}`}
            onClick={() => setActiveSubTab("outbound")}
          >
            <ArrowUpCircle size={16} /> Barang Keluar (Outbound)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "movements" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveSubTab("movements")}
          >
            <History size={16} /> Audit Log Mutasi
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: INBOUND STOCK (BARANG MASUK & PO) */}
      {activeSubTab === "inbound" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Direct Purchase / Consignment Form */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--emerald)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowDownCircle size={20} /> Form Barang Masuk Langsung
            </h3>

            <form onSubmit={handleInboundSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Pilih Sparepart *</label>
                <select
                  required
                  className="select-control"
                  value={inboundForm.product_id}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const p = products.find((pr) => pr.id === pid);
                    setInboundForm((prev) => ({ ...prev, product_id: pid, unit_cost: p ? p.cost_price : 0 }));
                  }}
                >
                  <option value="">-- Pilih Barang --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Tipe Inbound</label>
                  <select
                    className="select-control"
                    value={inboundForm.type}
                    onChange={(e) => setInboundForm({ ...inboundForm, type: e.target.value })}
                  >
                    <option value="IN_MANUAL">Pembelian Tunai Direct</option>
                    <option value="IN_CONSIGNMENT">Titipan Konsinyasi</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Jumlah Kuantitas Masuk *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-control"
                    value={inboundForm.quantity}
                    onChange={(e) => setInboundForm({ ...inboundForm, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Harga Beli HPP (Rp / Unit)</label>
                <input
                  type="number"
                  min="0"
                  className="input-control"
                  value={inboundForm.unit_cost}
                  onChange={(e) => setInboundForm({ ...inboundForm, unit_cost: Number(e.target.value) })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Nomor Referensi / SJ Supplier</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="SJ-2026/08/1001"
                  value={inboundForm.reference_number}
                  onChange={(e) => setInboundForm({ ...inboundForm, reference_number: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Catatan Tambahan</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Penerimaan langsung toko..."
                  value={inboundForm.notes}
                  onChange={(e) => setInboundForm({ ...inboundForm, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-emerald btn-lg" style={{ marginTop: "0.5rem" }}>
                <CheckCircle2 size={18} /> Simpan Penerimaan Stok (+ {inboundForm.quantity})
              </button>
            </form>
          </div>

          {/* Purchase Orders (PO) List Card */}
          <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Truck size={20} /> Purchase Orders (PO) Supplier
              </h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setPOToReceive(null);
                  setIsPOModalOpen(true);
                }}
              >
                <Plus size={14} /> Buat PO Baru
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {purchaseOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  Belum ada Purchase Order (PO).
                </div>
              ) : (
                purchaseOrders.map((po) => {
                  const suppObj = suppliers.find((s) => s.id === po.supplier_id);
                  const isReceived = po.status === "RECEIVED";

                  return (
                    <div
                      key={po.id}
                      style={{
                        background: "var(--bg-main)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {po.po_number}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Supplier: {suppObj?.name || "General"}
                        </div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--emerald)", marginTop: "0.25rem" }}>
                          Rp {po.total_amount.toLocaleString("id-ID")}
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                        <span className={`badge ${isReceived ? "badge-emerald" : "badge-amber"}`}>
                          {po.status}
                        </span>
                        {!isReceived && (
                          <button
                            className="btn btn-emerald btn-sm"
                            onClick={() => {
                              setPOToReceive(po);
                              setIsPOModalOpen(true);
                            }}
                          >
                            <CheckCircle2 size={13} /> Terima Barang
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OUTBOUND NON-SALES (BARANG RUSAK / PROMO) */}
      {activeSubTab === "outbound" && (
        <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem 0", color: "var(--rose)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowUpCircle size={20} /> Form Pencatatan Barang Keluar Non-Penjualan
            </h3>

            <form onSubmit={handleOutboundSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Pilih Sparepart *</label>
                <select
                  required
                  className="select-control"
                  value={outboundForm.product_id}
                  onChange={(e) => setOutboundForm({ ...outboundForm, product_id: e.target.value })}
                >
                  <option value="">-- Pilih Barang --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label className="input-label">Alasan Pengeluaran Stok</label>
                  <select
                    className="select-control"
                    value={outboundForm.type}
                    onChange={(e) => setOutboundForm({ ...outboundForm, type: e.target.value })}
                  >
                    <option value="OUT_DAMAGED">Barang Rusak / Cacat Pabrik (Adjust)</option>
                    <option value="OUT_GIFT">Pengujian Mekanik / Promosi (Gift)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Jumlah Kuantitas Keluar *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input-control"
                    value={outboundForm.quantity}
                    onChange={(e) => setOutboundForm({ ...outboundForm, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Nomor Berita Acara / Referensi</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="BA-RUSAK-2026/08"
                  value={outboundForm.reference_number}
                  onChange={(e) => setOutboundForm({ ...outboundForm, reference_number: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Penjelasan / Alasan Detail Kerusakan</label>
                <textarea
                  className="textarea-control"
                  rows="3"
                  placeholder="Jelaskan alasan pencatatan kerusakan atau pengeluaran sampel..."
                  value={outboundForm.notes}
                  onChange={(e) => setOutboundForm({ ...outboundForm, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-rose btn-lg" style={{ marginTop: "0.5rem" }}>
                <AlertTriangle size={18} /> Simpan Pengeluaran Stok (- {outboundForm.quantity})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: STOCK MOVEMENTS AUDIT LOG */}
      {activeSubTab === "movements" && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Riwayat Audit Mutasi Stok (All Movements)</h3>
            <span className="badge badge-blue">{sortedMovements.length} Log Records</span>
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Waktu &amp; Tanggal</th>
                <th>Sparepart / SKU</th>
                <th>Tipe Mutasi</th>
                <th>Kuantitas</th>
                <th>No. Referensi</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    Belum ada riwayat mutasi stok.
                  </td>
                </tr>
              ) : (
                sortedMovements.map((sm) => {
                  const p = products.find((prod) => prod.id === sm.product_id);
                  const isIncoming = sm.type.startsWith("IN_");

                  let badgeColor = "badge-blue";
                  if (sm.type === "IN_MANUAL" || sm.type === "IN_PO") badgeColor = "badge-emerald";
                  else if (sm.type === "IN_CONSIGNMENT") badgeColor = "badge-purple";
                  else if (sm.type === "OUT_POS") badgeColor = "badge-blue";
                  else if (sm.type === "OUT_DAMAGED") badgeColor = "badge-rose";
                  else if (sm.type === "OUT_GIFT") badgeColor = "badge-amber";

                  return (
                    <tr key={sm.id}>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {new Date(sm.created_at).toLocaleString("id-ID")}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{p?.name || "Sparepart"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>SKU: {p?.sku_number}</div>
                      </td>

                      <td>
                        <span className={`badge ${badgeColor}`}>{sm.type}</span>
                      </td>

                      <td style={{ fontWeight: 800, color: isIncoming ? "var(--emerald)" : "var(--rose)" }}>
                        {isIncoming ? `+${sm.quantity}` : `-${sm.quantity}`}
                      </td>

                      <td>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{sm.reference_number || "-"}</span>
                      </td>

                      <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {sm.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PO Modal */}
      <POModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        poToReceive={poToReceive}
      />
    </div>
  );
}
