// components/Layout.js
import React from "react";
import Navbar from "./NavbarInside";
import Sidebar from "./Sidebar";
import "../Styles/Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="main-wrapper">{children}</main>
      </div>
    </div>
  );
}
