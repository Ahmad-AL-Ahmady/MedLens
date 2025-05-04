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
  Menu,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Styles/Sidebar.css";
import Final from "../Images/Final.png";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    // Update main content class based on sidebar state
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      if (isExpanded) {
        mainContent.classList.add("expanded");
      } else {
        mainContent.classList.remove("expanded");
      }
    }
  }, [isExpanded]);

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
    <>
      {isMobile && (
        <button
          className="mobile-menu-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle menu"
        >
          <Menu className="icon" />
        </button>
      )}
      <aside
        className={`sidebar ${isExpanded ? "expanded" : "collapsed"} ${
          isMobile ? "mobile" : ""
        }`}
        style={
          isMobile
            ? {
                transform: isExpanded ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s ease",
              }
            : {}
        }
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={Final} alt="MedLens Logo" className="info-logo" />
            <span className="logo-text">MedLenes</span>
            {!isMobile && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="toggle-button"
                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isExpanded ? (
                  <ChevronLeft className="icon" />
                ) : (
                  <ChevronRight className="icon" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
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
              onClick={() => isMobile && setIsExpanded(false)}
            >
              <item.icon className="nav-icon" />
              {isExpanded && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`nav-item logout-button ${
              isExpanded ? "expanded" : "collapsed"
            }`}
          >
            <LogOut className="nav-icon" />
            {isExpanded && <span className="nav-label">Logout</span>}
          </button>
        </nav>
      </aside>
    </>
  );
}
