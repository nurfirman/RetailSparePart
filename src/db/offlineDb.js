import Dexie from "dexie";
import {
  DUMMY_USERS,
  DUMMY_CATEGORIES,
  DUMMY_SUPPLIERS,
  DUMMY_PRODUCTS,
  DUMMY_STOCK_MOVEMENTS,
  DUMMY_PURCHASE_ORDERS,
  DUMMY_TRANSACTIONS,
} from "../data/dummyData";

export const db = new Dexie("SparepartRetailPOS");

// Define Local IndexedDB Tables
db.version(1).stores({
  users: "id, email, name, role",
  categories: "id, name",
  suppliers: "id, name, is_consignment_active",
  products: "id, sku_number, oem_number, name, category_id, stock_quantity, min_stock_alert, is_consignment, supplier_id",
  stock_movements: "id, product_id, type, reference_number, created_at",
  purchase_orders: "id, po_number, supplier_id, status, created_at",
  transactions: "id, invoice_number, user_id, payment_method, created_at",
  held_carts: "id, customer_name, created_at",
  sync_queue: "++id, action, table, payload, created_at, status",
});

// Seed Initial Dummy Data if Database is Empty
export async function initializeLocalDatabase() {
  try {
    const userCount = await db.users.count();
    if (userCount === 0) {
      console.log("Initializing local IndexedDB with dummy sparepart dataset...");
      await db.users.bulkAdd(DUMMY_USERS);
      await db.categories.bulkAdd(DUMMY_CATEGORIES);
      await db.suppliers.bulkAdd(DUMMY_SUPPLIERS);
      await db.products.bulkAdd(DUMMY_PRODUCTS);
      await db.stock_movements.bulkAdd(DUMMY_STOCK_MOVEMENTS);
      await db.purchase_orders.bulkAdd(DUMMY_PURCHASE_ORDERS);
      await db.transactions.bulkAdd(DUMMY_TRANSACTIONS);
      console.log("Local database successfully seeded!");
    }
  } catch (err) {
    console.error("Failed to initialize Dexie local database:", err);
  }
}

// Reset Local Database Function
export async function resetAndReseedDatabase() {
  await db.transaction(
    "rw",
    [
      db.users,
      db.categories,
      db.suppliers,
      db.products,
      db.stock_movements,
      db.purchase_orders,
      db.transactions,
      db.held_carts,
      db.sync_queue,
    ],
    async () => {
      await db.users.clear();
      await db.categories.clear();
      await db.suppliers.clear();
      await db.products.clear();
      await db.stock_movements.clear();
      await db.purchase_orders.clear();
      await db.transactions.clear();
      await db.held_carts.clear();
      await db.sync_queue.clear();

      await db.users.bulkAdd(DUMMY_USERS);
      await db.categories.bulkAdd(DUMMY_CATEGORIES);
      await db.suppliers.bulkAdd(DUMMY_SUPPLIERS);
      await db.products.bulkAdd(DUMMY_PRODUCTS);
      await db.stock_movements.bulkAdd(DUMMY_STOCK_MOVEMENTS);
      await db.purchase_orders.bulkAdd(DUMMY_PURCHASE_ORDERS);
      await db.transactions.bulkAdd(DUMMY_TRANSACTIONS);
    }
  );
  console.log("Database reset and re-seeded successfully!");
}
