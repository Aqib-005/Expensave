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
      // Save token in cookie so fetch with credentials works
      document.cookie = `token=${token}; path=/; SameSite=None; Secure`;

      // Fetch user data from backend
      fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((user) => {
          setUser(user);
        })
        .catch((err) => console.error("Failed to fetch user:", err));

      // Clean token from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, setUser, API_URL]);

  return children;
}

export default TokenHandler;

