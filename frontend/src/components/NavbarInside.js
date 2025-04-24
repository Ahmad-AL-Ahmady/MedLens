import React from "react";
import { Bell, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import "../Styles/Navbar.css";
export default function Navbar() {
  const location = useLocation();
  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/scan":
        return "Scan Dashboard";
      case "/pharmacy":
        return "Pharmacy";
      case "/patient":
        return "Patient Management";
      case "/doctor":
        return "Doctor Portal";
      default:
        return "Dashboard";
    }
  };
  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <h1 className="navbar-title">{getPageTitle(location.pathname)}</h1>
        <div className="navbar-actions">
          <button className="navbar-button">
            <Bell className="navbar-icon" />
          </button>
          <button className="navbar-button">
            <Settings className="navbar-icon" />
          </button>
          <div className="navbar-avatar"></div>
        </div>
      </div>
    </header>
  );
}
