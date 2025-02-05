import React from "react";
import { useSelector } from "react-redux";
import { FaInfoCircle } from "react-icons/fa";
import doctorImage from "../assets/images/doctor.jpg";
import "./AboutUs.css";

const AboutUs = () => {
  const about = useSelector((state) => state.about);

  return (
    <div className="about-container" id="aboutSection">
      <div className="about-text">
        <div className="about-header">
          <FaInfoCircle className="icon" />
          <span>About Us</span>
        </div>
        <h6>{about.title}</h6>
        <p>
          <strong>{about.icon1}Our Mission & Goals:</strong> {about.mission}
        </p>
        <p>
          <strong>{about.icon2}Technology We Use:</strong> {about.technology}
        </p>
      </div>
      <div className="hexagon-border">
        <div className="about-image">
          <img src={doctorImage} alt="Doctor and Patient" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
