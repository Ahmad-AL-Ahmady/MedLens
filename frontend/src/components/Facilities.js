import React from "react";
import { useSelector } from "react-redux";
import { selectFacilities } from "../redux/facilitiesSlice";
import "./Facilities.css";

function Facilities() {
  const facilities = useSelector(selectFacilities);

  return (
    <div className="facilities-container" id="serviceSection">
      <div className="head-container">
        <div className="left-section">
          <span className="icon">🛠️</span>
          <span className="text">Our Service</span>
        </div>
        <h2 className="main-title">How Can I Help You ?</h2>
      </div>
      <div className="facilities-grid">
        {facilities.map((facility) => (
          <div key={facility.id} className="facility-card">
            <span className="facility-icon">{facility.icon}</span>
            <h3>{facility.title}</h3>
            <p>{facility.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Facilities;
