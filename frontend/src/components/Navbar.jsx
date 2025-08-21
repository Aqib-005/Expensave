import React from "react";
import "../styles/navbar.css"

function Navbar() {
  return (
    <nav className="navbar">
      <a className="nav-logo" href="/">Logo
      </a>
      <div className="nav-directories">
        <a className="nav-link" href="/dashboard"> Dashboard </a>
        <a className="nav-link" href="/login"> Log-in </a>
      </div>
    </nav>
  )
}

export default Navbar;
