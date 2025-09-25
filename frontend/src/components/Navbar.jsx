import React, { useState } from "react";
import "../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { FaUserCircle } from "react-icons/fa";
import config from "./config.json";

function Navbar() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const API_URL = config.API_URL;

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("auth_token");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link className="nav-logo" to="/">
        <img src="/src/assets/logo.png" alt="logo" className="logo" />
        Expensave
      </Link>

      <div className="nav-right">
        <Link className="nav-link" to="/dashboard">Dashboard</Link>
        <Link className="nav-link" to="/transactions">Transactions</Link>
        {!loading && (
          user ? (
            <div className="user-menu">
              <FaUserCircle
                className="user-icon"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div className="user-dropdown">
                  <span className="dropdown-item">{user.name.toUpperCase()}.</span>
                  <Link className="dropdown-item" to="/settings">Settings</Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="nav-link" to="/login">Login</Link>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;

