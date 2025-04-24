import React, { useState, useEffect } from "react";
import {
  Users,
  LayoutDashboard,
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
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Function to get role from storage
    const getRoleFromStorage = () => {
      // Check localStorage first, then sessionStorage
      const roleFromLocal = localStorage.getItem("userRole");
      const roleFromSession = sessionStorage.getItem("userRole");
      const role = roleFromLocal || roleFromSession || null;

      console.log("Current user role from storage:", role);
      return role;
    };

    // Set initial role
    setUserRole(getRoleFromStorage());

    // Add event listener for storage changes (in case user logs in in another tab)
    const handleStorageChange = (event) => {
      if (event.key === "userRole") {
        setUserRole(getRoleFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Get correct dashboard path based on user role
  const getDashboardPath = () => {
    if (userRole === "Patient") {
      return "/patient-dashboard";
    } else if (userRole === "Doctor") {
      return "/doctor-dashboard";
    } else if (userRole === "Pharmacy") {
      return "/pharmacy-dashboard";
    }
    return "/"; // Fallback
  };

  // Define menu items with role-based visibility
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: getDashboardPath(),
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
    {
      icon: ScanEye,
      label: "Scan",
      path: "/scan",
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
    {
      icon: Pill,
      label: "Pharmacy",
      path: "/pharmacy",
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
    {
      icon: Users,
      label: "Patient",
      path: "/patient",
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
    {
      icon: Stethoscope,
      label: "Doctor",
      path: "/doctor",
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = userRole
    ? menuItems.filter((item) => item.roles.includes(userRole))
    : [];

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
        {filteredMenuItems.map((item) => (
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
