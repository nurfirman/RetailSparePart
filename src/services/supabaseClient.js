import { createClient } from "@supabase/supabase-js";

// Helper to get saved Supabase Config from LocalStorage or environment
export function getSupabaseConfig() {
  const url =
    localStorage.getItem("SUPABASE_URL") ||
    import.meta.env.VITE_SUPABASE_URL ||
    "";
  const anonKey =
    localStorage.getItem("SUPABASE_ANON_KEY") ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "";
  return { url, anonKey };
}

// Save Supabase credentials to localStorage
export function saveSupabaseConfig(url, anonKey) {
  localStorage.setItem("SUPABASE_URL", url.trim());
  localStorage.setItem("SUPABASE_ANON_KEY", anonKey.trim());
}

// Initialize Supabase Client instance dynamically
export function getSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || url === "" || anonKey === "") {
    return null;
  }
  try {
    return createClient(url, anonKey);
  } catch (err) {
    console.warn("Failed to initialize Supabase Client:", err);
    return null;
  }
}

// Test Connection to Supabase Cloud
export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "Kredensial Supabase belum diisi." };
  }
  try {
    const { data, error } = await client.from("categories").select("count").limit(1);
    if (error) throw error;
    return { success: true, message: "Koneksi ke Supabase Cloud BERHASIL!", data };
  } catch (err) {
    return { success: false, message: `Gagal terkoneksi: ${err.message}` };
  }
}
