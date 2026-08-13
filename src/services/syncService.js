import { db } from "../db/offlineDb";
import { getNeonSql } from "./neonClient";
import {
  DUMMY_USERS,
  DUMMY_CATEGORIES,
  DUMMY_SUPPLIERS,
  DUMMY_PRODUCTS,
} from "../data/dummyData";

// Table specific column definition maps to strictly match Neon Postgres schema
const TABLE_COLUMNS = {
  users: ["id", "email", "name", "role", "created_at"],
  suppliers: ["id", "name", "phone", "address", "is_consignment_active", "created_at"],
  categories: ["id", "name", "description", "created_at"],
  products: [
    "id", "sku_number", "oem_number", "name", "category_id",
    "vehicle_compatibility", "cost_price", "selling_price",
    "stock_quantity", "min_stock_alert", "bin_location",
    "is_consignment", "supplier_id", "barcode", "created_at", "updated_at",
  ],
  stock_movements: [
    "id", "product_id", "type", "quantity", "reference_number",
    "notes", "user_id", "created_at",
  ],
  purchase_orders: [
    "id", "po_number", "supplier_id", "status", "total_amount",
    "created_at", "updated_at",
  ],
  purchase_order_items: [
    "id", "po_id", "product_id", "qty_ordered", "qty_received", "unit_cost",
  ],
  transactions: [
    "id", "invoice_number", "user_id", "total_amount", "discount_amount",
    "payment_method", "payment_status", "customer_name", "notes", "created_at",
  ],
  transaction_items: [
    "id", "transaction_id", "product_id", "quantity", "unit_price", "subtotal",
  ],
};

// Priority ordering for syncing tables to satisfy foreign key constraints
const TABLE_SYNC_PRIORITY = [
  "users",
  "categories",
  "suppliers",
  "products",
  "purchase_orders",
  "purchase_order_items",
  "transactions",
  "transaction_items",
  "stock_movements",
];

function isValidTable(table) {
  return Boolean(TABLE_COLUMNS[table]);
}

/**
 * Filter payload keys to only include valid column names for the target table
 */
function sanitizePayload(table, payload) {
  const allowed = TABLE_COLUMNS[table] || [];
  const clean = {};
  for (const key of Object.keys(payload)) {
    if (allowed.includes(key)) {
      clean[key] = payload[key];
    }
  }
  return clean;
}

/**
 * Queue a local mutation action for syncing to Neon Cloud when online
 */
export async function queueSyncItem(action, table, payload) {
  if (!isValidTable(table)) {
    console.error(`Sync rejected: invalid table name "${table}"`);
    return;
  }
  try {
    const cleanPayload = sanitizePayload(table, payload);
    await db.sync_queue.add({
      action,
      table,
      payload: cleanPayload,
      created_at: new Date().toISOString(),
      status: "PENDING",
    });
  } catch (err) {
    console.error("Failed to add mutation to sync_queue:", err);
  }
}

/**
 * Check if app is online
 */
export function isOnlineNetwork() {
  return navigator.onLine;
}

/**
 * Auto seed master data to Neon Postgres if Neon database is completely empty
 */
async function ensureRemoteMasterDataSeeded(sql) {
  try {
    // 1. Always ensure all local users exist in Neon Postgres Cloud to prevent foreign key constraint violations
    const localUsers = await db.users.toArray();
    for (const u of localUsers) {
      await sql`INSERT INTO "users" ("id", "email", "name", "role", "created_at")
                VALUES (${u.id}, ${u.email}, ${u.name}, ${u.role}, ${u.created_at || new Date().toISOString()})
                ON CONFLICT ("id") DO UPDATE SET "name" = ${u.name}, "email" = ${u.email}, "role" = ${u.role}`;
    }

    const checkProd = await sql`SELECT COUNT(*) as count FROM "products"`;
    if (Number(checkProd[0]?.count || 0) === 0) {
      console.log("Neon Postgres database is empty. Seeding initial master data to Neon Cloud...");
      
      for (const u of DUMMY_USERS) {
        await sql`INSERT INTO "users" ("id", "email", "name", "role", "created_at") VALUES (${u.id}, ${u.email}, ${u.name}, ${u.role}, ${u.created_at}) ON CONFLICT DO NOTHING`;
      }
      for (const c of DUMMY_CATEGORIES) {
        await sql`INSERT INTO "categories" ("id", "name", "description") VALUES (${c.id}, ${c.name}, ${c.description}) ON CONFLICT DO NOTHING`;
      }
      for (const s of DUMMY_SUPPLIERS) {
        await sql`INSERT INTO "suppliers" ("id", "name", "phone", "address", "is_consignment_active") VALUES (${s.id}, ${s.name}, ${s.phone}, ${s.address}, ${s.is_consignment_active}) ON CONFLICT DO NOTHING`;
      }
      for (const p of DUMMY_PRODUCTS) {
        await sql`INSERT INTO "products" ("id", "sku_number", "oem_number", "name", "category_id", "vehicle_compatibility", "cost_price", "selling_price", "stock_quantity", "min_stock_alert", "bin_location", "is_consignment", "supplier_id", "barcode") VALUES (${p.id}, ${p.sku_number}, ${p.oem_number}, ${p.name}, ${p.category_id}, ${p.vehicle_compatibility}, ${p.cost_price}, ${p.selling_price}, ${p.stock_quantity}, ${p.min_stock_alert}, ${p.bin_location}, ${p.is_consignment}, ${p.supplier_id}, ${p.barcode}) ON CONFLICT DO NOTHING`;
      }
      for (const t of DUMMY_TRANSACTIONS) {
        await sql`INSERT INTO "transactions" ("id", "invoice_number", "user_id", "total_amount", "discount_amount", "payment_method", "payment_status", "customer_name", "notes", "created_at") VALUES (${t.id}, ${t.invoice_number}, ${t.user_id}, ${t.total_amount}, ${t.discount_amount}, ${t.payment_method}, ${t.payment_status}, ${t.customer_name}, ${t.notes}, ${t.created_at}) ON CONFLICT DO NOTHING`;
        if (t.items && t.items.length > 0) {
          for (const item of t.items) {
            await sql`INSERT INTO "transaction_items" ("id", "transaction_id", "product_id", "quantity", "unit_price", "subtotal") VALUES (${item.id}, ${t.id}, ${item.product_id}, ${item.quantity}, ${item.unit_price}, ${item.subtotal}) ON CONFLICT DO NOTHING`;
          }
        }
      }
      console.log("Master data & initial transactions successfully seeded to Neon Cloud!");
    }
  } catch (err) {
    console.warn("Notice: Master data auto-seed check skipped or failed:", err.message);
  }
}

/**
 * Synchronize local pending items to Neon Postgres Cloud
 */
export async function syncNow() {
  if (!navigator.onLine) {
    return { success: false, message: "Koneksi internet tidak tersedia (Offline)." };
  }

  const sql = getNeonSql();
  if (!sql) {
    return {
      success: false,
      message: "Connection String Neon belum terkonfigurasi di Pengaturan.",
    };
  }

  try {
    // 1. Ensure initial master data exists in Neon Cloud
    await ensureRemoteMasterDataSeeded(sql);

    // 2. Fetch pending mutations from queue
    const pendingItems = await db.sync_queue.where("status").equals("PENDING").toArray();

    if (pendingItems.length === 0) {
      await pullRemoteUpdates(sql);
      return { success: true, message: "Semua data sudah tersinkronisasi dengan Neon Cloud!", syncedCount: 0 };
    }

    // Sort mutations by table foreign-key dependency order
    pendingItems.sort((a, b) => {
      const idxA = TABLE_SYNC_PRIORITY.indexOf(a.table);
      const idxB = TABLE_SYNC_PRIORITY.indexOf(b.table);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    let successCount = 0;
    let failCount = 0;
    let lastErrorMsg = "";

    for (const item of pendingItems) {
      if (!isValidTable(item.table)) {
        console.error(`Skipping sync item #${item.id}: invalid table "${item.table}"`);
        await db.sync_queue.update(item.id, { status: "FAILED" });
        failCount++;
        continue;
      }

      const payload = sanitizePayload(item.table, item.payload);

      try {
        if (item.action === "INSERT") {
          const keys = Object.keys(payload);
          if (keys.length === 0) throw new Error("Payload contains no valid columns.");
          
          const values = Object.values(payload);
          const cols = keys.map((k) => `"${k}"`).join(", ");
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
          
          const updateClause = keys.map((k, i) => `"${k}" = $${keys.length + i + 1}`).join(", ");
          const queryStr = `INSERT INTO "${item.table}" (${cols}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateClause}`;
          await sql.query(queryStr, [...values, ...values]);
        } else if (item.action === "UPDATE") {
          const { id, ...updateData } = payload;
          const keys = Object.keys(updateData);
          const values = Object.values(updateData);
          
          if (keys.length > 0 && id) {
            const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
            const queryStr = `UPDATE "${item.table}" SET ${setClause} WHERE "id" = $${keys.length + 1}`;
            await sql.query(queryStr, [...values, id]);
          }
        } else if (item.action === "DELETE") {
          if (payload.id) {
            const queryStr = `DELETE FROM "${item.table}" WHERE "id" = $1`;
            await sql.query(queryStr, [payload.id]);
          }
        }

        await db.sync_queue.update(item.id, { status: "SYNCED" });
        successCount++;
      } catch (itemErr) {
        console.error(`Sync item #${item.id} (${item.action} on ${item.table}) FAILED:`, itemErr);
        lastErrorMsg = itemErr.message;
        await db.sync_queue.update(item.id, { status: "FAILED" });
        failCount++;
      }
    }

    // Clean up synced items from queue
    await db.sync_queue.where("status").equals("SYNCED").delete();

    // Pull remote updates back to local IndexedDB
    await pullRemoteUpdates(sql);

    if (failCount > 0) {
      return {
        success: false,
        message: `Sync parsial: ${successCount} berhasil, ${failCount} gagal. Detail: ${lastErrorMsg}`,
        syncedCount: successCount,
      };
    }

    return {
      success: true,
      message: `Berhasil mengunggah & menyinkronkan ${successCount} data ke Neon Postgres Cloud!`,
      syncedCount: successCount,
    };
  } catch (err) {
    console.error("Sync error:", err);
    return { success: false, message: `Gagal sinkronisasi ke Neon: ${err.message}` };
  }
}

/**
 * Pull latest products/categories/suppliers/transactions from Neon to IndexedDB
 */
async function pullRemoteUpdates(sql) {
  try {
    const remoteProducts = await sql`SELECT * FROM "products"`;
    if (remoteProducts && remoteProducts.length > 0) {
      await db.products.bulkPut(remoteProducts);
    }

    const remoteCategories = await sql`SELECT * FROM "categories"`;
    if (remoteCategories && remoteCategories.length > 0) {
      await db.categories.bulkPut(remoteCategories);
    }

    const remoteSuppliers = await sql`SELECT * FROM "suppliers"`;
    if (remoteSuppliers && remoteSuppliers.length > 0) {
      await db.suppliers.bulkPut(remoteSuppliers);
    }
  } catch (err) {
    console.warn("Could not pull remote updates from Neon Postgres:", err.message);
  }
}
