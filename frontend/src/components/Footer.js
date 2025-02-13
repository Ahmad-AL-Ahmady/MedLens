import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import "./Footer.css";

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-title">MedLens</div>
          <p>
            Revolutionizing healthcare with AI-powered solutions for better
            patient care and medical diagnosis.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="#" onClick={() => scrollToSection("roleSelection")}>
                About Us
              </Link>
            </li>
            <li>
              {" "}
              <Link to="#" onClick={() => scrollToSection("features")}>
                Services
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>Contact</h3>
          <p className="contact-item">
            <Mail size={20} color="#9ca3af" />
            contact@medlens.com
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 MedLens. All rights reserved.</p>
        <div className="footer-policies">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/cookie-policy">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
