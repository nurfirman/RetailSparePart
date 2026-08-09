import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { queueSyncItem } from "../../services/syncService";
import { ProductModal } from "./ProductModal";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Boxes,
  Car,
  Layers,
  Tag,
  CheckCircle2,
} from "lucide-react";

export function ProductMaster() {
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filtered dataset
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.oem_number && p.oem_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.vehicle_compatibility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.bin_location && p.bin_location.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;

    const matchesLowStock = !onlyLowStock || p.stock_quantity <= p.min_stock_alert;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // KPIs
  const totalSku = products.length;
  const totalStockItems = products.reduce((sum, p) => sum + p.stock_quantity, 0);
  const lowStockCount = products.filter((p) => p.stock_quantity <= p.min_stock_alert).length;
  const consignmentCount = products.filter((p) => p.is_consignment).length;

  const handleEdit = (prod) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Apakah Anda yakin ingin menghapus sparepart "${name}"?`)) {
      await db.products.delete(id);
      await queueSyncItem("DELETE", "products", { id });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Master Data Sparepart
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Katalog Suku Cadang Motor &amp; Mobil, OEM Part Number, Kompatibilitas &amp; Rak
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={18} /> Tambah Sparepart Baru
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--primary-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <Package color="var(--primary)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL SKU</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{totalSku} Item</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--emerald-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <Boxes color="var(--emerald)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL FISIK STOK</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--emerald)" }}>{totalStockItems} Pcs</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--rose-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <AlertTriangle color="var(--rose)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STOK KRITIS / MENIPIS</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--rose)" }}>{lowStockCount} SKU</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--purple-light)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
            <Layers color="var(--purple)" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>BARANG KONSINYASI</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--purple)" }}>{consignmentCount} SKU</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: "2.3rem" }}
            placeholder="Cari sparepart berdasar Nama, SKU, OEM, Rak, Kompatibilitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: "200px" }}>
          <select
            className="select-control"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`btn ${onlyLowStock ? "btn-rose" : "btn-outline"}`}
          onClick={() => setOnlyLowStock(!onlyLowStock)}
        >
          <AlertTriangle size={16} /> Stok Menipis ({lowStockCount})
        </button>
      </div>

      {/* Products Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>SKU / OEM Part</th>
              <th>Nama Sparepart &amp; Kendaraan</th>
              <th>Kategori</th>
              <th>Lokasi Rak</th>
              <th>HPP (Cost)</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Tidak ada data sparepart yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const catObj = categories.find((c) => c.id === p.category_id);
                const isOut = p.stock_quantity <= 0;
                const isLow = p.stock_quantity <= p.min_stock_alert;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--primary)" }}>{p.sku_number}</div>
                      {p.oem_number && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OEM: {p.oem_number}</div>}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {p.name}
                        {p.is_consignment && (
                          <span className="badge badge-purple" style={{ marginLeft: "0.5rem", fontSize: "0.65rem" }}>
                            Konsinyasi
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                        <Car size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {p.vehicle_compatibility}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-blue">{catObj?.name || "General"}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {p.bin_location || "Rak A-01"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Rp {p.cost_price.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--emerald)" }}>
                        Rp {p.selling_price.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td>
                      {isOut ? (
                        <span className="badge badge-rose">Habis (0)</span>
                      ) : isLow ? (
                        <span className="badge badge-amber">Menipis ({p.stock_quantity})</span>
                      ) : (
                        <span className="badge badge-emerald">Aman ({p.stock_quantity})</span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          className="btn btn-rose btn-sm"
                          onClick={() => handleDelete(p.id, p.name)}
                        >
                          <Trash2 size={14} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={selectedProduct}
      />
    </div>
  );
}
