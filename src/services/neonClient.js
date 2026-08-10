import { neon } from "@neondatabase/serverless";

/**
 * Get saved Neon Database URL from LocalStorage or Vite Environment
 */
export function getNeonConfig() {
  const databaseUrl =
    localStorage.getItem("NEON_DATABASE_URL") ||
    import.meta.env.VITE_NEON_DATABASE_URL ||
    "";
  return { databaseUrl };
}

/**
 * Save Neon Database URL to LocalStorage
 * @param {string} databaseUrl 
 */
export function saveNeonConfig(databaseUrl) {
  localStorage.setItem("NEON_DATABASE_URL", databaseUrl.trim());
}

/**
 * Get Neon SQL Query client instance
 */
export function getNeonSql() {
  const { databaseUrl } = getNeonConfig();
  if (!databaseUrl) {
    return null;
  }
  try {
    return neon(databaseUrl);
  } catch (err) {
    console.warn("Failed to initialize Neon SQL Client:", err);
    return null;
  }
}

/**
 * Test Connection to Neon Cloud Database
 */
export async function testNeonConnection() {
  const sql = getNeonSql();
  if (!sql) {
    return { success: false, message: "Connection String Neon belum diisi." };
  }
  try {
    const result = await sql`SELECT NOW() as current_time, NOW() as time`;
    return {
      success: true,
      message: `Koneksi ke Neon Postgres Cloud BERHASIL! (Server Time: ${result[0]?.current_time || "OK"})`,
      data: result,
    };
  } catch (err) {
    return { success: false, message: `Gagal terkoneksi ke Neon: ${err.message}` };
  }
}
