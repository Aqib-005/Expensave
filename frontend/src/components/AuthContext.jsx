import { createContext, useContext, useState, useEffect, useCallback } from "react";
import config from "./config.json";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = config.API_URL;

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (res.status === 401) {
        setUser(null);
        return null;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.status}`);
      }

      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

