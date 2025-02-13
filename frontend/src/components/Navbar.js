import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img src={logo} alt="logo" className="logo" />
        <div className="nav-brand">MedLens</div>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          {menuOpen && (
            <FaTimes
              className="close-menu"
              onClick={() => setMenuOpen(false)}
            />
          )}
          <Link to="#" onClick={() => scrollToSection("features")}>
            Services
          </Link>
          <Link to="#" onClick={() => scrollToSection("roleSelection")}>
            About Us
          </Link>
          <Link to="/careers">Careers</Link>
          <Link to="/news">News</Link>
          <button
            className="nav-button mobile-login"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
