import React, { useState } from "react";
import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
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
    setUser(null);
    setMenuOpen(false);
    //navigate("/");
  };

  return (
    <nav className="navbar">
      <a className="nav-logo" href="/">Logo</a>

      <div className="nav-right">
        <a className="nav-link" href="/transactions">Dashboard</a>
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
                  <a className="dropdown-item" href="/settings">Settings</a>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a className="nav-link" href="/login">Login</a>
          )
        )}
      </div>
    </nav>
  );
}

export default Navbar;

