import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; // Import the X icon for the close state
import { useLocation, useNavigate } from "react-router-dom";
import "../Styles/Navbar.css";

export default function Navbar({
  toggleSidebar,
  isSidebarOpen,
  isSidebarExpanded,
}) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      return;
    }

    fetch("http://localhost:4000/api/profiles", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setUser(data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError(error.message);
      });
  }, []);

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
      case "/profile/patient":
        return "Patient Profile";
      case "/profile/doctor":
        return "Doctor Profile";
      case "/profile/pharmacy":
        return "Pharmacy Profile";
      default:
        return "Dashboard";
    }
  };
  const navigate = useNavigate();

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <button className="mobile-menu-button" onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <X className="icon" /> // Show X icon when sidebar is open
          ) : (
            <Menu className="icon" /> // Show Menu icon when sidebar is closed
          )}
        </button>
        <h1 className="navbar-title">{getPageTitle(location.pathname)}</h1>
        <div className="navbar-actions">
          <div className="navbar-avatar">
            <img
              src={`http://localhost:4000/public/uploads/users/${user?.user?.avatar}`}
              alt="Profile"
              className="profile-avatar"
              onClick={() => {
                if (!user || !user.user) {
                  alert("Please log in to view your profile.");
                  return;
                }
                switch (user.user.userType) {
                  case "Patient":
                    navigate("/profile/patient");
                    break;
                  case "Doctor":
                    navigate("/profile/doctor");
                    break;
                  case "Pharmacy":
                    navigate("/profile/pharmacy");
                    break;
                  default:
                    navigate("/login");
                }
              }}
              title="View Profile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
