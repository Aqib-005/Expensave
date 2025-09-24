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
    const loggedIn = params.get("logged_in");

    if (loggedIn) {
      // Fetch user data from backend (cookie should already be set by backend)
      fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      })
        .then((res) => {
          console.log("Fetch /auth/me status:", res.status);
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((user) => {
          console.log("Fetched user:", user);
          setUser(user);
        })
        .catch((err) => console.error("Failed to fetch user:", err));

      // Clean up query param from URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, setUser, API_URL]);

  return children;
}

export default TokenHandler;

