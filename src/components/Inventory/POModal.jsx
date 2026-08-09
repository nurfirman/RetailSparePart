import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { queueSyncItem } from "../../services/syncService";
import { X, Save, FileText, Plus, Trash2, CheckCircle2 } from "lucide-react";

export function POModal({ isOpen, onClose, poToReceive }) {
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const [supplierId, setSupplierId] = useState("");
  const [poItems, setPoItems] = useState([
    { product_id: "", qty_ordered: 5, unit_cost: 0 },
  ]);

  useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }
  }, [suppliers]);

  const handleAddItemRow = () => {
    setPoItems((prev) => [...prev, { product_id: products[0]?.id || "", qty_ordered: 5, unit_cost: 0 }]);
  };

  const handleRemoveRow = (index) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index, prodId) => {
    const prod = products.find((p) => p.id === prodId);
    setPoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, product_id: prodId, unit_cost: prod ? prod.cost_price : 0 } : item))
    );
  };

  const handleQtyChange = (index, qty) => {
    setPoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, qty_ordered: Math.max(1, Number(qty)) } : item))
    );
  };

  const handleCostChange = (index, cost) => {
    setPoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, unit_cost: Math.max(0, Number(cost)) } : item))
    );
  };

  // Submit New Purchase Order
  const handleSavePO = async (statusTarget = "ORDERED") => {
    if (!supplierId || poItems.length === 0) {
      alert("Pilih supplier dan minimal 1 produk!");
      return;
    }

    const totalAmount = poItems.reduce((s, i) => s + i.qty_ordered * i.unit_cost, 0);
    const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;

    const newPO = {
      id: `po-${Date.now()}`,
      po_number: poNumber,
      supplier_id: supplierId,
      status: statusTarget,
      total_amount: totalAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: poItems.map((pi) => ({
        id: `poi-${Date.now()}-${Math.random()}`,
        product_id: pi.product_id,
        qty_ordered: pi.qty_ordered,
        qty_received: 0,
        unit_cost: pi.unit_cost,
      })),
    };

    try {
      await db.purchase_orders.add(newPO);
      await queueSyncItem("INSERT", "purchase_orders", {
        id: newPO.id,
        po_number: newPO.po_number,
        supplier_id: newPO.supplier_id,
        status: newPO.status,
        total_amount: newPO.total_amount,
        created_at: newPO.created_at,
      });

      alert(`Purchase Order ${poNumber} berhasil dibuat dengan status ${statusTarget}!`);
      onClose();
    } catch (err) {
      alert(`Gagal membuat PO: ${err.message}`);
    }
  };

  // Process Receiving (Penerimaan Barang PO)
  const handleReceivePO = async (po) => {
    try {
      // 1. Update PO Status
      await db.purchase_orders.update(po.id, { status: "RECEIVED", updated_at: new Date().toISOString() });
      await queueSyncItem("UPDATE", "purchase_orders", { id: po.id, status: "RECEIVED" });

      // 2. Add Stock & Log Movements for each item
      if (po.items && po.items.length > 0) {
        for (const item of po.items) {
          const prod = await db.products.get(item.product_id);
          if (prod) {
            const newStock = prod.stock_quantity + (item.qty_ordered || 1);
            // Optionally update HPP if unit cost changed
            const newCost = item.unit_cost > 0 ? item.unit_cost : prod.cost_price;

            await db.products.update(prod.id, { stock_quantity: newStock, cost_price: newCost });
            await queueSyncItem("UPDATE", "products", { id: prod.id, stock_quantity: newStock, cost_price: newCost });

            // Stock movement log
            const sm = {
              id: `sm-${Date.now()}-${Math.random()}`,
              product_id: prod.id,
              type: "IN_PO",
              quantity: item.qty_ordered || 1,
              reference_number: po.po_number,
              notes: `Penerimaan PO Supplier`,
              user_id: "usr-002",
              created_at: new Date().toISOString(),
            };
            await db.stock_movements.add(sm);
            await queueSyncItem("INSERT", "stock_movements", sm);
          }
        }
      }

      alert(`Barang dari ${po.po_number} berhasil diterima! Stok otomatis bertambah.`);
      onClose();
    } catch (err) {
      alert(`Gagal memproses penerimaan: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText color="var(--primary)" size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              {poToReceive ? `Penerimaan Barang: ${poToReceive.po_number}` : "Buat Purchase Order (PO) Baru"}
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {poToReceive ? (
            /* Receive existing PO View */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                <div><strong>No PO:</strong> {poToReceive.po_number}</div>
                <div><strong>Status:</strong> <span className="badge badge-amber">{poToReceive.status}</span></div>
                <div><strong>Total Nilai:</strong> Rp {poToReceive.total_amount.toLocaleString("id-ID")}</div>
              </div>

              <h4 style={{ fontSize: "0.9rem", margin: "0.5rem 0 0 0" }}>Daftar Barang PO Yang Diterima:</h4>
              {poToReceive.items?.map((item, idx) => {
                const p = products.find((prod) => prod.id === item.product_id);
                return (
                  <div key={idx} style={{ background: "var(--bg-main)", padding: "0.75rem", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p?.name || "Sparepart"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Qty Order: {item.qty_ordered} Pcs • Harga Beli: Rp {item.unit_cost.toLocaleString("id-ID")}</div>
                    </div>
                    <span className="badge badge-emerald">+ {item.qty_ordered} Stok</span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Create new PO View */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label">Pilih Supplier *</label>
                <select
                  className="select-control"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.is_consignment_active ? "(Supplier Konsinyasi)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "0.9rem", margin: 0 }}>Item Barang Order:</h4>
                <button className="btn btn-secondary btn-sm" onClick={handleAddItemRow}>
                  <Plus size={14} /> Tambah Item Baris
                </button>
              </div>

              {poItems.map((row, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 80px 140px 40px", gap: "0.5rem", alignItems: "center" }}>
                  <select
                    className="select-control"
                    value={row.product_id}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                  >
                    <option value="">-- Pilih Sparepart --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku_number})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="input-control"
                    placeholder="Qty"
                    value={row.qty_ordered}
                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                  />

                  <input
                    type="number"
                    min="0"
                    className="input-control"
                    placeholder="Harga HPP Rp"
                    value={row.unit_cost}
                    onChange={(e) => handleCostChange(idx, e.target.value)}
                  />

                  {poItems.length > 1 && (
                    <button
                      className="btn btn-rose btn-sm"
                      style={{ padding: "0.4rem" }}
                      onClick={() => handleRemoveRow(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Batal
          </button>
          {poToReceive ? (
            <button className="btn btn-emerald" onClick={() => handleReceivePO(poToReceive)}>
              <CheckCircle2 size={16} /> Verifikasi &amp; Terima Barang
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => handleSavePO("ORDERED")}>
              <Save size={16} /> Kirim PO Ke Supplier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
