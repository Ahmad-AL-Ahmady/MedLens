import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../Styles/Layout.css";
import Navbar from "./NavbarInside";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="layout-container">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsSidebarExpanded={setIsSidebarExpanded}
      />
      <div
        className={`main-content ${
          isSidebarExpanded ? "expanded" : "collapsed"
        }`}
      >
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isSidebarExpanded={isSidebarExpanded}
        />
        <main className="main-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
