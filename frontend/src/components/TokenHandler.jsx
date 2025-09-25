import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function TokenHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loggedIn = params.get("logged_in");

    if (loggedIn) {
      // Refresh user from backend (cookie should already be set)
      fetchUser();

      // Clean up query param
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, fetchUser]);

  return children;
}

export default TokenHandler;

