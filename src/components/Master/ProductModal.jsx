import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { queueSyncItem } from "../../services/syncService";
import { X, Save, PackagePlus } from "lucide-react";

export function ProductModal({ isOpen, onClose, productToEdit }) {
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  const [formData, setFormData] = useState({
    sku_number: "",
    oem_number: "",
    name: "",
    category_id: "",
    vehicle_compatibility: "",
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    min_stock_alert: 5,
    bin_location: "Rak A-01",
    is_consignment: false,
    supplier_id: "",
    barcode: "",
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData({
        sku_number: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        oem_number: "",
        name: "",
        category_id: categories[0]?.id || "cat-001",
        vehicle_compatibility: "",
        cost_price: 0,
        selling_price: 0,
        stock_quantity: 10,
        min_stock_alert: 5,
        bin_location: "Rak A-01",
        is_consignment: false,
        supplier_id: suppliers[0]?.id || "sup-001",
        barcode: String(899100100000 + Math.floor(Math.random() * 9999)),
      });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku_number) {
      alert("Nama barang dan SKU wajib diisi!");
      return;
    }

    try {
      if (productToEdit) {
        // Update
        const updated = { ...formData, updated_at: new Date().toISOString() };
        await db.products.put(updated);
        await queueSyncItem("UPDATE", "products", updated);
      } else {
        // Insert
        const newProduct = {
          ...formData,
          id: `prod-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await db.products.add(newProduct);
        await queueSyncItem("INSERT", "products", newProduct);
      }
      onClose();
    } catch (err) {
      alert(`Gagal menyimpan produk: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  // Margin calculation
  const marginRp = formData.selling_price - formData.cost_price;
  const marginPct = formData.cost_price > 0 ? ((marginRp / formData.cost_price) * 100).toFixed(1) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PackagePlus color="var(--primary)" size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              {productToEdit ? "Edit Sparepart" : "Tambah Master Sparepart Baru"}
            </h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">Nama Sparepart *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Contoh: Kampas Rem Depan Honda Vario 125/150"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Kode SKU *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="BRK-VAR-001"
                value={formData.sku_number}
                onChange={(e) => handleChange("sku_number", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nomor Part OEM (Pabrikan)</label>
              <input
                type="text"
                className="input-control"
                placeholder="06455-KVB-T01"
                value={formData.oem_number}
                onChange={(e) => handleChange("oem_number", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Kategori Barang</label>
              <select
                className="select-control"
                value={formData.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Lokasi Rak / Bin Location</label>
              <input
                type="text"
                className="input-control"
                placeholder="Rak A-02"
                value={formData.bin_location}
                onChange={(e) => handleChange("bin_location", e.target.value)}
              />
            </div>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label className="input-label">Kompatibilitas Kendaraan (Jenis/Model &amp; Tahun)</label>
              <input
                type="text"
                className="input-control"
                placeholder="Contoh: Honda Vario 125 (2012-2023), Vario 150 (2015-2022), Beat FI"
                value={formData.vehicle_compatibility}
                onChange={(e) => handleChange("vehicle_compatibility", e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Harga Beli Pokok (HPP) Rp</label>
              <input
                type="number"
                min="0"
                className="input-control"
                value={formData.cost_price}
                onChange={(e) => handleChange("cost_price", Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Harga Jual Retail Rp</label>
              <input
                type="number"
                min="0"
                className="input-control"
                value={formData.selling_price}
                onChange={(e) => handleChange("selling_price", Number(e.target.value))}
              />
            </div>

            {/* Margin Indicator Preview */}
            <div style={{ gridColumn: "1 / -1", background: "var(--bg-input)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
              <span>Perkiraan Keuntungan Kotor (Margin):</span>
              <strong style={{ color: marginRp >= 0 ? "var(--emerald)" : "var(--rose)" }}>
                Rp {marginRp.toLocaleString("id-ID")} ({marginPct}%)
              </strong>
            </div>

            <div className="input-group">
              <label className="input-label">Jumlah Stok Saat Ini</label>
              <input
                type="number"
                min="0"
                className="input-control"
                value={formData.stock_quantity}
                onChange={(e) => handleChange("stock_quantity", Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Batas Stok Minimum (Alert)</label>
              <input
                type="number"
                min="1"
                className="input-control"
                value={formData.min_stock_alert}
                onChange={(e) => handleChange("min_stock_alert", Number(e.target.value))}
              />
            </div>

            <div className="input-group" style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.is_consignment}
                  onChange={(e) => handleChange("is_consignment", e.target.checked)}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Barang Titipan Konsinyasi Supplier</span>
              </label>
            </div>

            {formData.is_consignment && (
              <div className="input-group" style={{ gridColumn: "1 / -1" }}>
                <label className="input-label">Pilih Supplier Konsinyasi</label>
                <select
                  className="select-control"
                  value={formData.supplier_id}
                  onChange={(e) => handleChange("supplier_id", e.target.value)}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.is_consignment_active ? "(Mitra Konsinyasi)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Simpan Sparepart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
