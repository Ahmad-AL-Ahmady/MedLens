import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Pill,
  ScanEye,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Styles/Sidebar.css";
import Final from "../Images/Final.png";

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  setIsSidebarExpanded,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsExpanded(true);
      } else {
        setIsExpanded(isSidebarOpen);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarExpanded(isExpanded);
  }, [isExpanded, setIsSidebarExpanded]);

  useEffect(() => {
    const getRoleFromStorage = () => {
      return (
        localStorage.getItem("userRole") ||
        sessionStorage.getItem("userRole") ||
        null
      );
    };

    setUserRole(getRoleFromStorage());

    const handleStorageChange = (event) => {
      if (event.key === "userRole") {
        setUserRole(getRoleFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getDashboardPath = () => {
    if (userRole === "Patient") return "/patient-dashboard";
    if (userRole === "Doctor") return "/doctor-dashboard";
    if (userRole === "Pharmacy") return "/pharmacy-dashboard";
    return "/";
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userRole");
        sessionStorage.removeItem("userRole");
        navigate("/login");
      }
    });
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
      icon: Stethoscope,
      label: "Doctor",
      path: "/doctor",
      roles: ["Patient", "Doctor", "Pharmacy"],
    },
  ];

  const filteredMenuItems = userRole
    ? menuItems.filter((item) => item.roles.includes(userRole))
    : [];

  return (
    <aside
      className={`sidebar ${
        isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
      } ${isMobile ? "sidebar-mobile" : ""}`}
      style={
        isMobile
          ? { transform: isExpanded ? "translateX(0)" : "translateX(-100%)" }
          : {}
      }
    >
      <div className="sidebar-header">
        <div
          className="sidebar-logo-container"
          onMouseEnter={() => !isMobile && setIsExpanded(true)}
        >
          <img src={Final} alt="MedLens Logo" className="sidebar-info-logo" />
          <span className="sidebar-logo-text">MedLens</span>
        </div>
        {isMobile && isExpanded && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-button"
            aria-label="Close sidebar"
          >
            <X className="sidebar-icon" />
          </button>
        )}
      </div>
      <nav className="sidebar-nav-container">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "sidebar-active" : ""} ${
                isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
              }`
            }
            onClick={() => isMobile && setIsSidebarOpen(false)}
          >
            <item.icon className="sidebar-nav-icon" />
            {isExpanded && (
              <span className="sidebar-nav-label">{item.label}</span>
            )}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className={`sidebar-nav-item sidebar-logout-button ${
            isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
        >
          <LogOut className="sidebar-nav-icon" />
          {isExpanded && <span className="sidebar-nav-label">Logout</span>}
        </button>
      </nav>
    </aside>
  );
}
