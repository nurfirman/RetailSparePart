import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../db/offlineDb";

const AuthContext = createContext();

// Simple password map for demo users (in production, use proper hashing)
const DEMO_PASSWORDS = {
  "admin@sparepart.com": "admin123",
  "gudang@sparepart.com": "gudang123",
  "kasir@sparepart.com": "kasir123",
};

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
      // Don't auto-login to first user anymore — require explicit login
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
    const users = await db.users.toArray();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    
    if (!found) {
      return { success: false, message: "Email tidak ditemukan dalam sistem." };
    }

    // Validate password against known demo passwords
    const expectedPassword = DEMO_PASSWORDS[found.email.toLowerCase()];
    if (!expectedPassword || password !== expectedPassword) {
      return { success: false, message: "Kata sandi salah. Silakan coba lagi." };
    }

    setCurrentUser(found);
    localStorage.setItem("ACTIVE_USER_ID", found.id);
    setAllUsers(users);
    return { success: true, user: found };
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
