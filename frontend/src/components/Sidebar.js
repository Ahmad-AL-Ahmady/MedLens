import React, { useState, useEffect } from "react";
import {
  Users,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Pill,
  ScanEye,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // <- import sweetalert2
import "../Styles/Sidebar.css";
import Final from "../Images/Final.png";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getRoleFromStorage = () => {
      const roleFromLocal = localStorage.getItem("userRole");
      const roleFromSession = sessionStorage.getItem("userRole");
      const role = roleFromLocal || roleFromSession || null;

      console.log("Current user role from storage:", role);
      return role;
    };

    setUserRole(getRoleFromStorage());

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

  const getDashboardPath = () => {
    if (userRole === "Patient") {
      return "/patient-dashboard";
    } else if (userRole === "Doctor") {
      return "/doctor-dashboard";
    } else if (userRole === "Pharmacy") {
      return "/pharmacy-dashboard";
    }
    return "/";
  };

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

  const filteredMenuItems = userRole
    ? menuItems.filter((item) => item.roles.includes(userRole))
    : [];

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      // Clear storage
      localStorage.removeItem("userRole");
      sessionStorage.removeItem("userRole");

      // Show success alert
      await Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been successfully logged out.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if logout fails, clear storage
      localStorage.removeItem("userRole");
      sessionStorage.removeItem("userRole");

      // Show error alert
      await Swal.fire({
        icon: "error",
        title: "Logout Error",
        text: "Something went wrong during logout. Please try again.",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });

      navigate("/login");
    }
  };

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

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className={`nav-item logout-button ${
          isExpanded ? "expanded" : "collapsed"
        }`}
      >
        <LogOut className="nav-icon" />
        {isExpanded && <span className="nav-label">Logout</span>}
      </button>
    </aside>
  );
}
