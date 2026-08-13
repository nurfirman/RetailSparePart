import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../db/offlineDb";
import { queueSyncItem } from "../services/syncService";

const AuthContext = createContext();

// Simple password map for default demo users
const DEMO_PASSWORDS = {
  "admin@sparepart.com": "admin123",
  "gudang@sparepart.com": "gudang123",
  "kasir@sparepart.com": "kasir123",
};

// Helper function to hash password securely using Web Crypto API (SHA-256 with salt)
async function hashPassword(password, salt = "retail_sparepart_salt_2026") {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const users = await db.users.toArray();
      setAllUsers(users);
      const savedUserId = localStorage.getItem("ACTIVE_USER_ID");
      const found = users.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      }
    } catch (err) {
      console.error("Auth context error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const switchUser = (userId) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem("ACTIVE_USER_ID", target.id);
    }
  };

  const loginWithEmail = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const users = await db.users.toArray();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: "Email belum terdaftar. Silakan daftar akun terlebih dahulu." };
    }

    // Check if account has a stored password hash (registered user) or demo password
    if (found.password_hash) {
      const inputHash = await hashPassword(password);
      if (inputHash !== found.password_hash) {
        return { success: false, message: "Kata sandi salah. Silakan periksa kembali." };
      }
    } else {
      const expectedPassword = DEMO_PASSWORDS[cleanEmail];
      if (!expectedPassword || password !== expectedPassword) {
        return { success: false, message: "Kata sandi salah. Silakan coba lagi." };
      }
    }

    setCurrentUser(found);
    localStorage.setItem("ACTIVE_USER_ID", found.id);
    setAllUsers(users);
    return { success: true, user: found };
  };

  const signUpWithEmail = async ({ name, email, password, role }) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: "Format alamat email tidak valid." };
    }

    // Password strength check (min 8 chars)
    if (password.length < 8) {
      return { success: false, message: "Kata sandi minimal 8 karakter." };
    }

    const users = await db.users.toArray();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: "Email sudah terdaftar. Silakan login atau gunakan email lain." };
    }

    // Hash password before saving
    const password_hash = await hashPassword(password);
    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: cleanEmail,
      role: role || "Kasir (POS Operator)",
      password_hash,
      created_at: new Date().toISOString(),
    };

    try {
      await db.users.add(newUser);
      
      // Also queue user to sync engine so Neon Cloud database registers this user ID
      await queueSyncItem("INSERT", "users", newUser);

      const updatedUsers = await db.users.toArray();
      setAllUsers(updatedUsers);
      setCurrentUser(newUser);
      localStorage.setItem("ACTIVE_USER_ID", newUser.id);
      return { success: true, user: newUser };
    } catch (err) {
      console.error("Failed to register user:", err);
      return { success: false, message: "Gagal menyimpan akun baru: " + err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ACTIVE_USER_ID");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        loginWithEmail,
        signUpWithEmail,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

