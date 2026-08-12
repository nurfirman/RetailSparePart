import React, { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/offlineDb";
import { useAuth } from "../../context/AuthContext";
import { queueSyncItem } from "../../services/syncService";
import { useToast } from "../UI/ToastProvider";
import { useConfirmDialog } from "../UI/ConfirmDialog";
import { HoldCartModal } from "./HoldCartModal";
import { ReceiptModal } from "./ReceiptModal";
import { TransactionHistoryModal } from "./TransactionHistoryModal";
import {
  Search,
  Filter,
  Car,
  ScanBarcode,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  Clock,
  CreditCard,
  QrCode,
  DollarSign,
  Building2,
  Tag,
  CheckCircle,
  AlertTriangle,
  History,
} from "lucide-react";

export function POSModule() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [ConfirmDialogEl, showConfirm] = useConfirmDialog();

  // Fetch Live Data from Dexie IndexedDB
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  // Cart State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("Pelanggan Umum");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountPaid, setAmountPaid] = useState("");

  // Modals & Hold Carts State
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [heldCount, setHeldCount] = useState(0);

  // Load held carts count
  useEffect(() => {
    const checkHeld = async () => {
      const count = await db.held_carts.count();
      setHeldCount(count);
    };
    checkHeld();
  }, [isHoldModalOpen]);

  // Dynamic vehicle options extracted from product data
  const vehicleOptions = useMemo(() => {
    const allVehicles = new Set();
    products.forEach((p) => {
      if (p.vehicle_compatibility) {
        // Split by comma to get individual vehicle entries
        p.vehicle_compatibility.split(",").forEach((v) => {
          const trimmed = v.trim();
          if (trimmed) allVehicles.add(trimmed);
        });
      }
    });
    return ["Semua Kendaraan", ...Array.from(allVehicles).sort()];
  }, [products]);

  // Filtered Product List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.oem_number && p.oem_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.barcode && p.barcode.includes(searchTerm)) ||
      p.vehicle_compatibility.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;

    const matchesVehicle =
      selectedVehicle === "all" ||
      selectedVehicle === "Semua Kendaraan" ||
      p.vehicle_compatibility.toLowerCase().includes(selectedVehicle.toLowerCase());

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  // Cart Actions
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast.warning(`${product.name} stok habis!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.warning(`Stok produk ${product.name} terbatas (${product.stock_quantity} unit)`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          itemDiscount: 0, // nominal discount per item
        },
      ];
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            const targetProd = products.find((p) => p.id === productId);
            if (targetProd && newQty > targetProd.stock_quantity) {
              toast.warning(`Stok maksimal tersedia: ${targetProd.stock_quantity}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateItemDiscount = (productId, discountVal) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, itemDiscount: Math.max(0, Number(discountVal)) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
    setAmountPaid("");
    setCustomerName("Pelanggan Umum");
  };

  // Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + (item.selling_price * item.quantity - item.itemDiscount),
    0
  );
  const totalDiscount = Math.max(0, Number(globalDiscount));
  const finalTotal = Math.max(0, cartSubtotal - totalDiscount);
  const numPaid = Number(amountPaid) || 0;
  const changeAmount = paymentMethod === "CASH" ? Math.max(0, numPaid - finalTotal) : 0;

  // Barcode Scanner Simulation
  const simulateBarcodeScan = () => {
    const target = products.find((p) => p.barcode === "899100100201") || products[0];
    if (target) {
      addToCart(target);
    } else {
      toast.warning("Produk dengan barcode tersebut tidak ditemukan.");
    }
  };

  // F4 Keyboard Shortcut for Checkout
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F4") {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, paymentMethod, amountPaid, finalTotal]);

  // Hold Cart Action
  const handleHoldCart = async () => {
    if (cart.length === 0) return;
    await db.held_carts.add({
      customer_name: customerName || "Pelanggan Tanpa Nama",
      items: cart,
      created_at: new Date().toISOString(),
    });
    clearCart();
    const count = await db.held_carts.count();
    setHeldCount(count);
    toast.info("Transaksi disimpan di antrean hold.");
  };

  const handleResumeCart = (resumedItems, resumedCustomer) => {
    setCart(resumedItems);
    setCustomerName(resumedCustomer || "Pelanggan Umum");
  };

  // Process Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning("Keranjang belanja masih kosong!");
      return;
    }

    if (paymentMethod === "CASH" && numPaid < finalTotal) {
      toast.error("Jumlah pembayaran tunai kurang dari total tagihan!");
      return;
    }

    // Confirmation dialog before checkout
    const confirmed = await showConfirm({
      title: "Konfirmasi Pembayaran",
      message: `Proses pembayaran Rp ${finalTotal.toLocaleString("id-ID")} via ${paymentMethod} untuk ${customerName}?`,
      confirmLabel: "Bayar Sekarang",
      variant: "info",
    });
    if (!confirmed) return;

    const now = new Date();
    // UUID-based invoice to prevent collision (was 3-digit random)
    const uid = crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${uid}`;

    const transactionId = `trx-${Date.now()}-${uid}`;
    const transactionData = {
      id: transactionId,
      invoice_number: invoiceNumber,
      user_id: currentUser?.id || "usr-003",
      total_amount: finalTotal,
      discount_amount: totalDiscount,
      payment_method: paymentMethod,
      payment_status: "PAID",
      customer_name: customerName,
      cashier_name: currentUser?.name || "Siti Rahma",
      amount_paid: paymentMethod === "CASH" ? numPaid : finalTotal,
      change_amount: changeAmount,
      created_at: now.toISOString(),
      items: cart.map((item) => ({
        id: `titem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        transaction_id: transactionId,
        product_id: item.id,
        name: item.name,
        oem_number: item.oem_number,
        quantity: item.quantity,
        unit_price: item.selling_price,
        subtotal: item.selling_price * item.quantity - item.itemDiscount,
      })),
    };

    try {
      // 1. Save Transaction to Dexie IndexedDB
      await db.transactions.add(transactionData);
      await queueSyncItem("INSERT", "transactions", {
        id: transactionData.id,
        invoice_number: transactionData.invoice_number,
        user_id: transactionData.user_id,
        total_amount: transactionData.total_amount,
        discount_amount: transactionData.discount_amount,
        payment_method: transactionData.payment_method,
        payment_status: transactionData.payment_status,
        customer_name: transactionData.customer_name,
        created_at: transactionData.created_at,
      });

      // 2. Save line items & Deduct Product Stock
      for (const item of cart) {
        const itemId = `titem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        // Line item sync queue
        await queueSyncItem("INSERT", "transaction_items", {
          id: itemId,
          transaction_id: transactionData.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.selling_price,
          subtotal: item.selling_price * item.quantity - (item.itemDiscount || 0),
        });

        // Deduct stock in IndexedDB
        const targetProd = await db.products.get(item.id);
        if (targetProd) {
          const newStock = Math.max(0, targetProd.stock_quantity - item.quantity);
          await db.products.update(item.id, { stock_quantity: newStock });
          await queueSyncItem("UPDATE", "products", { id: item.id, stock_quantity: newStock });

          // Stock movement log
          const smData = {
            id: `sm-${Date.now()}-${Math.random()}`,
            product_id: item.id,
            type: "OUT_POS",
            quantity: item.quantity,
            reference_number: invoiceNumber,
            notes: `Penjualan POS Kasir (${customerName})`,
            user_id: currentUser?.id || "usr-003",
            created_at: now.toISOString(),
          };
          await db.stock_movements.add(smData);
          await queueSyncItem("INSERT", "stock_movements", smData);
        }
      }

      // Show receipt modal
      setCurrentTransaction(transactionData);
      setIsReceiptModalOpen(true);
      clearCart();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(`Gagal memproses transaksi: ${err.message}`);
    }
  };

  return (
    <div className="pos-layout-container">
      {/* LEFT COLUMN: CATALOG SEARCH & PRODUCT GRID */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "hidden" }}>
        {/* Search & Filter Controls Bar */}
        <div className="glass-card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: "2.3rem" }}
                placeholder="Cari sparepart (Nama, No. OEM, SKU, atau Kompatibilitas)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Vehicle Compatibility Filter */}
            <div style={{ flex: "0 0 160px", width: "160px" }}>
              <select
                className="select-control"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                {vehicleOptions.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Barcode Scanner Simulation Button */}
            <button
              className="btn btn-secondary"
              onClick={simulateBarcodeScan}
              title="Simulasi Scan Barcode SKU"
            >
              <ScanBarcode size={18} color="var(--primary)" />
              Scan Barcode
            </button>
          </div>

          {/* Category Pills */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.25rem", webkitOverflowScrolling: "touch" }}>
            <button
              className={`btn btn-sm ${selectedCategory === "all" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCategory("all")}
            >
              Semua ({products.length})
            </button>
            {categories.map((cat) => {
              const catCount = products.filter((p) => p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${selectedCategory === cat.id ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name} ({catCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="pos-product-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              Tidak ada sparepart yang sesuai pencarian / filter.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOut = product.stock_quantity <= 0;
              const isLow = product.stock_quantity <= product.min_stock_alert;

              return (
                <div
                  key={product.id}
                  className="glass-card"
                  onClick={() => !isOut && addToCart(product)}
                  style={{
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: isOut ? "not-allowed" : "pointer",
                    opacity: isOut ? 0.5 : 1,
                    position: "relative",
                  }}
                >
                  <div>
                    {/* OEM & Consignment badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>
                        SKU: {product.sku_number}
                      </span>
                      {product.is_consignment && (
                        <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>
                          Konsinyasi
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", lineHeight: 1.3 }}>
                      {product.name}
                    </h4>

                    {product.oem_number && (
                      <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, marginBottom: "0.35rem" }}>
                        OEM: {product.oem_number}
                      </div>
                    )}

                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      <Car size={11} style={{ display: "inline", marginRight: "3px" }} />
                      {product.vehicle_compatibility}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.5rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Bin: {product.bin_location || "Rak A-01"}
                      </div>

                      {/* Stock Badge */}
                      {isOut ? (
                        <span className="badge badge-rose">Habis</span>
                      ) : isLow ? (
                        <span className="badge badge-amber">Stok {product.stock_quantity}</span>
                      ) : (
                        <span className="badge badge-emerald">Stok {product.stock_quantity}</span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--emerald)" }}>
                        Rp {product.selling_price.toLocaleString("id-ID")}
                      </span>
                      <button
                        disabled={isOut}
                        className="btn btn-primary btn-sm"
                        style={{ padding: "0.25rem 0.5rem" }}
                      >
                        <Plus size={14} /> Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE SHOPPING CART & CHECKOUT */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Cart Header */}
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingCart color="var(--primary)" size={20} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Keranjang POS</h3>
            <span className="badge badge-blue">{cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
          </div>

          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="btn btn-secondary btn-sm"
              title="Buka riwayat & panggil transaksi terdahulu"
            >
              <History size={14} /> Riwayat
            </button>
            <button
              onClick={() => setIsHoldModalOpen(true)}
              className="btn btn-outline btn-sm"
              title="Lihat transaksi yang di-hold"
            >
              <Clock size={14} /> Hold ({heldCount})
            </button>
            <button
              onClick={handleHoldCart}
              disabled={cart.length === 0}
              className="btn btn-amber btn-sm"
              title="Simpan sementara cart ini"
            >
              <PauseCircle size={14} /> Hold Trx
            </button>
          </div>
        </div>

        {/* Customer Input */}
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-input)" }}>
          <input
            type="text"
            className="input-control"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.75rem" }}
            placeholder="Nama Pelanggan / No. Polisi Kendaraan..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        {/* Cart Line Items Scroll Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted)", padding: "2rem" }}>
              <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
              <div>Keranjang belanja kosong</div>
              <div style={{ fontSize: "0.75rem" }}>Pilih sparepart di sebelah kiri untuk menambah</div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {item.name}
                    </div>
                    {item.oem_number && (
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        OEM: {item.oem_number}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                  {/* Quantity Stepper */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.15rem 0.4rem" }}
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: "24px", textAlign: "center", fontSize: "0.85rem" }}>
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.15rem 0.4rem" }}
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--emerald)" }}>
                    Rp {(item.selling_price * item.quantity - item.itemDiscount).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Financial Summary & Payment Options */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
          {/* Global Order Discount */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Diskon Trx (Rp):</span>
            <input
              type="number"
              className="input-control"
              style={{ width: "120px", padding: "0.25rem 0.5rem", fontSize: "0.85rem", textAlign: "right" }}
              value={globalDiscount}
              onChange={(e) => setGlobalDiscount(Number(e.target.value))}
            />
          </div>

          {/* Subtotal & Total */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
            <span>Subtotal:</span>
            <span>Rp {cartSubtotal.toLocaleString("id-ID")}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
            <span>TOTAL:</span>
            <span style={{ color: "var(--emerald)" }}>Rp {finalTotal.toLocaleString("id-ID")}</span>
          </div>

          {/* Payment Method Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.35rem", marginBottom: "0.75rem" }}>
            {[
              { id: "CASH", label: "Cash", icon: DollarSign },
              { id: "QRIS", label: "QRIS", icon: QrCode },
              { id: "TRANSFER", label: "Bank", icon: Building2 },
              { id: "CARD", label: "Kartu", icon: CreditCard },
            ].map((pm) => {
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  style={{
                    padding: "0.4rem 0.25rem",
                    borderRadius: "var(--radius-sm)",
                    border: paymentMethod === pm.id ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: paymentMethod === pm.id ? "var(--primary-light)" : "var(--bg-input)",
                    color: paymentMethod === pm.id ? "var(--primary)" : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.15rem",
                  }}
                >
                  <Icon size={14} />
                  {pm.label}
                </button>
              );
            })}
          </div>

          {/* CASH Presets & Change Calculation */}
          {paymentMethod === "CASH" && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.35rem" }}>
                {[
                  { label: "Pas", val: finalTotal },
                  { label: "50rb", val: 50000 },
                  { label: "100rb", val: 100000 },
                  { label: "200rb", val: 200000 },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, padding: "0.2rem", fontSize: "0.7rem" }}
                    onClick={() => setAmountPaid(p.val)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="number"
                  className="input-control"
                  placeholder="Jumlah Tunai Rp..."
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                <div style={{ minWidth: "120px", textAlign: "right" }}>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Kembalian:</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: numPaid >= finalTotal ? "var(--emerald)" : "var(--rose)" }}>
                    Rp {changeAmount.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Big Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="btn btn-emerald btn-lg"
            style={{ width: "100%", boxShadow: "var(--shadow-glow)" }}
          >
            BAYAR &amp; CETAK STRUK (F4)
          </button>
        </div>
      </div>

      {/* Modals */}
      <HoldCartModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onResumeCart={handleResumeCart}
      />

      <TransactionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onViewReceipt={(tx) => {
          setCurrentTransaction(tx);
          setIsReceiptModalOpen(true);
        }}
        onRecallToCart={(items, customer) => {
          setCart(items);
          setCustomerName(customer);
        }}
      />

      {ConfirmDialogEl}

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={currentTransaction}
        onNewTransaction={clearCart}
      />
    </div>
  );
}
