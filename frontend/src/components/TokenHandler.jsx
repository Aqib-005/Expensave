import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import config from "./config.json";

function TokenHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const API_URL = config.API_URL;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("auth_token", token);
      navigate(location.pathname, { replace: true });
    }

    async function fetchUser() {
      const storedToken = localStorage.getItem("auth_token");

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include", // try cookie
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        const user = await res.json();
        setUser(user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }

    fetchUser();
  }, [location, navigate, setUser, API_URL]);

  return children;
}

export default TokenHandler;

