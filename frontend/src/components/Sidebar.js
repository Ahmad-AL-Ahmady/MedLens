import React, { useState } from "react";
import {
  Users,
  Home,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Pill,
  ScanEye,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "../Styles/Sidebar.css";
import Final from "../Images/Final.png";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: ScanEye, label: "Scan", path: "/scan" },
    { icon: Pill, label: "Pharmacy", path: "/pharmacy" },
    { icon: Users, label: "Patient", path: "/patient" },
    { icon: Stethoscope, label: "Doctor", path: "/doctor" },
  ];

  return (
    <aside className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        {isExpanded && (
          <div className="logo-container">
            <img src={Final} alt="MedLens Logo" className="info-logo" />
            <span className="logo-text">MedLenes</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="toggle-button"
        >
          {isExpanded ? (
            <ChevronLeft className="icon" />
          ) : (
            <ChevronRight className="icon" />
          )}
        </button>
      </div>

      <nav className="nav-container">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""} ${
                isExpanded ? "expanded" : "collapsed"
              }`
            }
          >
            <item.icon className="nav-icon" />
            {isExpanded && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
