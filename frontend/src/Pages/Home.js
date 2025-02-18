// HomePage.jsx
import React from "react";
import "../Styles/Home.css";

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="welcome-card">
        <h2 className="welcome-title">Welcome to MediScan</h2>
        <p className="welcome-text">
          Access all your medical scanning and diagnostic tools from one central
          location.
        </p>
      </div>
    </div>
  );
}
