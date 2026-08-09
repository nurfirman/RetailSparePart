import { db } from "../db/offlineDb";
import { getSupabaseClient } from "./supabaseClient";

/**
 * Queue a local mutation action for syncing to Supabase Cloud when online
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
 * Check if app is online and Supabase is connected
 */
export function isOnlineNetwork() {
  return navigator.onLine;
}

/**
 * Synchronize local pending items to Supabase Cloud
 */
export async function syncNow() {
  if (!navigator.onLine) {
    return { success: false, message: "Koneksi internet tidak tersedia (Offline)." };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: "Supabase belum terkonfigurasi. Data tersimpan di database lokal (IndexedDB).",
    };
  }

  try {
    const pendingItems = await db.sync_queue.where("status").equals("PENDING").toArray();

    if (pendingItems.length === 0) {
      // Also pull latest remote products if any
      await pullRemoteUpdates(supabase);
      return { success: true, message: "Semua data sudah tersinkronisasi sempurna!", syncedCount: 0 };
    }

    let successCount = 0;
    for (const item of pendingItems) {
      let resultError = null;

      if (item.action === "INSERT") {
        // Strip non-column metadata if any
        const { error } = await supabase.from(item.table).insert([item.payload]);
        resultError = error;
      } else if (item.action === "UPDATE") {
        const { id, ...updateData } = item.payload;
        const { error } = await supabase.from(item.table).update(updateData).eq("id", id);
        resultError = error;
      } else if (item.action === "DELETE") {
        const { error } = await supabase.from(item.table).delete().eq("id", item.payload.id);
        resultError = error;
      }

      if (!resultError) {
        await db.sync_queue.update(item.id, { status: "SYNCED" });
        successCount++;
      } else {
        console.warn(`Sync item #${item.id} error:`, resultError.message);
      }
    }

    // Clean up synced items from queue
    await db.sync_queue.where("status").equals("SYNCED").delete();

    // Pull changes back
    await pullRemoteUpdates(supabase);

    return {
      success: true,
      message: `Berhasil mengunggah ${successCount} transaksi/perubahan ke Supabase!`,
      syncedCount: successCount,
    };
  } catch (err) {
    console.error("Sync error:", err);
    return { success: false, message: `Gagal sinkronisasi: ${err.message}` };
  }
}

/**
 * Pull latest products/categories/suppliers from Supabase to IndexedDB
 */
async function pullRemoteUpdates(supabase) {
  try {
    const { data: remoteProducts } = await supabase.from("products").select("*");
    if (remoteProducts && remoteProducts.length > 0) {
      await db.products.bulkPut(remoteProducts);
    }

    const { data: remoteCategories } = await supabase.from("categories").select("*");
    if (remoteCategories && remoteCategories.length > 0) {
      await db.categories.bulkPut(remoteCategories);
    }

    const { data: remoteSuppliers } = await supabase.from("suppliers").select("*");
    if (remoteSuppliers && remoteSuppliers.length > 0) {
      await db.suppliers.bulkPut(remoteSuppliers);
    }
  } catch (err) {
    console.warn("Could not pull remote updates from Supabase:", err);
  }
}

