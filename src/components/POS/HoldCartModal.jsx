import React, { useState, useEffect } from "react";
import { db } from "../../db/offlineDb";
import { X, Play, Trash2, Clock } from "lucide-react";

export function HoldCartModal({ isOpen, onClose, onResumeCart }) {
  const [heldCarts, setHeldCarts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadHeldCarts();
    }
  }, [isOpen]);

  const loadHeldCarts = async () => {
    const carts = await db.held_carts.toArray();
    setHeldCarts(carts);
  };

  const handleDelete = async (id) => {
    await db.held_carts.delete(id);
    loadHeldCarts();
  };

  const handleResume = async (cart) => {
    onResumeCart(cart.items, cart.customer_name);
    await db.held_carts.delete(cart.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock color="var(--primary)" size={20} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Daftar Antrean Transaksi Di-Hold</h3>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {heldCarts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              Tidak ada antrean transaksi yang disimpan saat ini.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {heldCarts.map((cart) => {
                const totalItemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
                const totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.selling_price, 0);

                return (
                  <div
                    key={cart.id}
                    className="glass-card"
                    style={{
                      padding: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                        {cart.customer_name || "Pelanggan Tanpa Nama"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(cart.created_at).toLocaleTimeString("id-ID")} • {totalItemCount} Barang
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--emerald)", marginTop: "0.25rem" }}>
                        Rp {totalPrice.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleResume(cart)}
                      >
                        <Play size={14} /> Lanjutkan
                      </button>
                      <button
                        className="btn btn-rose btn-sm"
                        onClick={() => handleDelete(cart.id)}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
