import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../db/offlineDb";

const AuthContext = createContext();

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
      } else if (users.length > 0) {
        setCurrentUser(users[0]); // Default Owner/Admin
        localStorage.setItem("ACTIVE_USER_ID", users[0].id);
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
    // Standard simulation or match against users table
    const users = await db.users.toArray();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem("ACTIVE_USER_ID", found.id);
      return { success: true, user: found };
    }
    return { success: false, message: "Email tidak ditemukan atau kata sandi salah." };
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
