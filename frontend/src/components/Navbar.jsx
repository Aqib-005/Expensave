import React from "react";
import "../styles/navbar.css"

function Navbar() {
  return (
    <nav className="navbar">
      <a className="nav-logo" herf="/">Logo
      </a>
      <div className="nav-directories">
        <a className="nav-link" herf="/dashboard"> Dashboard </a>
        <a className="nav-link" herf="/login"> Log-in </a>
      </div>
    </nav>
  )
}

export default Navbar;
