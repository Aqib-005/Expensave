import { createContext, useContext, useState, useEffect } from "react";
import config from "./config.json";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = config.API_URL;

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.status === 401) {
          setUser(null);
        } else if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <div>
      <AuthContext.Provider value={{ user, setUser, loading }}>
        {children}
      </AuthContext.Provider>
    </div>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

