import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthSession, getStoredUserRole, setAuthSession } from "../utils/authStorage";

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { id: payload.id, role: payload.role || "user", exp: payload.exp };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser({ _id: decoded.id, role: decoded.role });
      } else {
        clearAuthSession();
      }
    }
    setLoading(false);
  }, []);

  const isAuthenticated = !!token;

  const login = (newToken, userData) => {
    setAuthSession({ token: newToken, user: userData });
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: () => user?.role === "admin" || getStoredUserRole() === "admin",
  }), [user, token, loading, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
