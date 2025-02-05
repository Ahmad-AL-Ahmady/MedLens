import React from "react";
import {
  FaBrain,
  FaBone,
  FaLungs,
  FaUserMd,
  FaHeartbeat,
} from "react-icons/fa";
import "./Stats.css";

const statsData = [
  { id: 1, icon: <FaHeartbeat />, count: "2,437", percentage: "+23.1%" },
  { id: 2, icon: <FaBrain />, count: "589", percentage: "+13.8%" },
  { id: 3, icon: <FaBone />, count: "768", percentage: "+16.3%" },
  { id: 4, icon: <FaLungs />, count: "325", percentage: "+7.8%" },
  { id: 5, icon: <FaUserMd />, count: "627", percentage: "+14.1%" },
];

const Stats = () => {
  return (
    <div className="stats-container">
      {statsData.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="icon">{stat.icon}</div>
          <div className="count">{stat.count}</div>
          <div className="percentage">{stat.percentage}</div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
