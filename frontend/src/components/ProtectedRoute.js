import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ requiredRole, children }) {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const userRole =
    localStorage.getItem("userRole") || sessionStorage.getItem("userRole");

  console.log("ProtectedRoute check - Required role:", requiredRole);
  console.log("ProtectedRoute check - User role:", userRole);

  if (!token || !userRole) {
    console.log("No token or role found, redirecting to login");
    return <Navigate to="/login" />;
  }

  // Case-insensitive comparison (or match the exact case from login)
  if (userRole.toLowerCase() !== requiredRole.toLowerCase()) {
    console.log("Role mismatch, redirecting to home");
    return <Navigate to="/" />;
  }

  console.log("Access granted to protected route");
  return children;
}

export default ProtectedRoute;
