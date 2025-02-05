import React, { useState } from "react";
import { Link } from "react-scroll";
import { NavLink } from "react-router-dom";
import logo from "../logoFull.jpg";
import "./Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? "✖️" : "☰"}
      </button>
      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={() => setMenuOpen(false)}
        >
          Home
        </NavLink>
        <Link
          to="aboutSection"
          smooth={true}
          duration={800}
          offset={-70}
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          About
        </Link>
        <Link
          to="serviceSection"
          smooth={true}
          duration={800}
          offset={-70}
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          Service
        </Link>
        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? "active-link" : "")}
          onClick={() => setMenuOpen(false)}
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className="signup-button"
          onClick={() => setMenuOpen(false)}
        >
          Sign Up
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
