import React from "react";
import { useSelector } from "react-redux";
import "./Overview.css";

const Overview = () => {
  const overview = useSelector((state) => state.overview);

  return (
    <div className="stats-grid">
      {overview.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-value">{stat.value}</div>
          <p className="stat-label">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default Overview;
