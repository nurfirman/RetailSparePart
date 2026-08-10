import { db } from "../db/offlineDb";
import { getNeonSql } from "./neonClient";

/**
 * Queue a local mutation action for syncing to Neon Cloud when online
 * @param {'INSERT'|'UPDATE'|'DELETE'} action 
 * @param {string} table 
 * @param {object} payload 
 */
export async function queueSyncItem(action, table, payload) {
  try {
    await db.sync_queue.add({
      action,
      table,
      payload,
      created_at: new Date().toISOString(),
      status: "PENDING",
    });
    console.log(`Queued ${action} on ${table} for cloud sync.`);
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
      message: "Database Neon belum terkonfigurasi. Data tersimpan di database lokal (IndexedDB).",
    };
  }

  try {
    const pendingItems = await db.sync_queue.where("status").equals("PENDING").toArray();

    if (pendingItems.length === 0) {
      await pullRemoteUpdates(sql);
      return { success: true, message: "Semua data sudah tersinkronisasi sempurna!", syncedCount: 0 };
    }

    let successCount = 0;
    for (const item of pendingItems) {
      try {
        if (item.action === "INSERT") {
          const keys = Object.keys(item.payload);
          const values = Object.values(item.payload);
          const cols = keys.map((k) => `"${k}"`).join(", ");
          const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
          
          const queryStr = `INSERT INTO "${item.table}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          await sql(queryStr, values);
        } else if (item.action === "UPDATE") {
          const { id, ...updateData } = item.payload;
          const keys = Object.keys(updateData);
          const values = Object.values(updateData);
          
          if (keys.length > 0) {
            const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
            const queryStr = `UPDATE "${item.table}" SET ${setClause} WHERE "id" = $${keys.length + 1}`;
            await sql(queryStr, [...values, id]);
          }
        } else if (item.action === "DELETE") {
          const queryStr = `DELETE FROM "${item.table}" WHERE "id" = $1`;
          await sql(queryStr, [item.payload.id]);
        }

        await db.sync_queue.update(item.id, { status: "SYNCED" });
        successCount++;
      } catch (itemErr) {
        console.warn(`Sync item #${item.id} error:`, itemErr.message);
      }
    }

    // Clean up synced items from queue
    await db.sync_queue.where("status").equals("SYNCED").delete();

    // Pull changes back
    await pullRemoteUpdates(sql);

    return {
      success: true,
      message: `Berhasil mengunggah ${successCount} transaksi/perubahan ke Neon Postgres!`,
      syncedCount: successCount,
    };
  } catch (err) {
    console.error("Sync error:", err);
    return { success: false, message: `Gagal sinkronisasi: ${err.message}` };
  }
}

/**
 * Pull latest products/categories/suppliers from Neon to IndexedDB
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


