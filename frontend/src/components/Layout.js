import React from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import Navbar from "./NavbarInside";
import Sidebar from "./Sidebar";
import "../Styles/Layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="main-wrapper">
          <Outlet />{" "}
          {/* This is where child components (dashboard, scan, etc.) will be rendered */}
        </main>
      </div>
    </div>
  );
}
