import React from "react";
import { Navigate } from "react-router-dom";

function AuthenticatedRoute({ children }) {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default AuthenticatedRoute;
