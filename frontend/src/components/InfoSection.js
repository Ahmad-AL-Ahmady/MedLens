import React from "react";
import {
  FaStethoscope,
  FaCalendarAlt,
  FaMedkit,
  FaRobot,
} from "react-icons/fa";
import whiteLogo from "../assets/images/Whitelogo.png";
import "../Styles/InfoSection.css";

function InfoSection() {
  const features = [
    {
      title: "AI-Powered Diagnosis",
      desc: "Get preliminary diagnoses using AI technology",
      icon: <FaRobot className="info-icon" />,
    },
    {
      title: "Easy Scheduling",
      desc: "Book appointments with professionals",
      icon: <FaCalendarAlt className="info-icon" />,
    },
    {
      title: "Online Pharmacy",
      desc: "Order medications with home delivery",
      icon: <FaMedkit className="info-icon" />,
    },
    {
      title: "Virtual Consultations",
      desc: "Connect with doctors from home",
      icon: <FaStethoscope className="info-icon" />,
    },
  ];

  return (
    <div className="info-container">
      <div className="info-content">
        <div className="info-logo-container">
          <img src={whiteLogo} alt="MedLens Logo" className="info-logo" />
          <h1 className="info-logo-text">MedLens</h1>
        </div>
        <h2 className="info-title">Experience Smart Healthcare</h2>
        <div className="info-list">
          {features.map((item) => (
            <div key={item.title} className="info-item">
              <h3 className="info-item-title">
                {item.icon}
                {item.title}
              </h3>
              <p className="info-item-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfoSection;
