import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-scroll";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>ABOUT US</h3>
          <p>
            We are a team of innovators dedicated to enhancing healthcare
            accessibility and efficiency using AI.
          </p>
        </div>
        <div className="footer-section links">
          <h3>USEFUL LINKS</h3>
          <ul>
            <li>
              <Link to="" smooth={true} duration={800}>
                Sign Up
              </Link>
            </li>
            <li>
              <Link to="" smooth={true} duration={800}>
                Login
              </Link>
            </li>
            <li>
              <Link to="aboutSection" smooth={true} duration={800}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="serviceSection" smooth={true} duration={800}>
                Services
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section services-F">
          <h3>SERVICES</h3>
          <p>Pharmacy Location</p>
          <p>Clinic Management</p>
          <p>Scan Analysis</p>
          <p>Appointment</p>
        </div>
      </div>

      <div className="footer-social">
        <FaFacebook />
        <FaTwitter />
        <FaInstagram />
        <FaLinkedin />
      </div>

      <p className="footer-bottom">© 2025 Health Vision. All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
