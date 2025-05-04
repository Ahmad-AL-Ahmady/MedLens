import React from "react";
import { Link } from "react-router-dom";
import { Users, Heart, Award, Mail, Briefcase } from "lucide-react";
import "../Styles/AboutUsPage.css";

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Ahmed Alashmawy",
      role: "Frontend Developer",
      bio: "Ahmed contributed to building the user interface, ensuring a seamless and intuitive experience for MedLens users.",
      expertise: "UI/UX Design, React, CSS, JavaScript",
      email: "ahmedashmaw33@gmail.com",
    },
    {
      name: "Ola Tarek",
      role: "Frontend Developer",
      bio: "Ola focused on crafting responsive and accessible frontend components to enhance user interaction.",
      expertise: "UI/UX Design, React, CSS, JavaScript",
      email: "olaatarek15@gmail.com",
    },
    {
      name: "Alzahraa El Sayed",
      role: "Frontend Developer",
      bio: "Alzhraa played a key role in developing dynamic frontend features, bringing MedLens to life.",
      expertise: "UI/UX Design, React, CSS, JavaScript",
      email: "zahraaelsayed23@gmail.com",
    },
    {
      name: "Karim Osama",
      role: "AI Developer",
      bio: "Kareim developed the AI-powered diagnostic tools, enabling accurate and efficient healthcare solutions.",
      expertise: "Machine Learning, AI Diagnostics",
      email: "karimosama519@gmail.com",
    },
    {
      name: "Ahmed Alahmady",
      role: "Backend Developer",
      bio: "Ahmed built the robust backend infrastructure, ensuring secure and scalable operations for MedLens.",
      expertise: "Node.js, Database Management",
      email: "ahmad.hussain.alahmady@gmail.com",
    },
  ];

  return (
    <div className="aboutus-page">
      <div className="aboutus-hero">
        <h1 className="aboutus-title">About Us</h1>
        <p className="aboutus-subtitle">
          Empowering healthcare through innovation and accessibility.
        </p>
      </div>
      <div className="aboutus-header">
        <div className="aboutus-header-buttons">
          <Link
            to="/"
            className="aboutus-header-button aboutus-home-button"
            aria-label="Return to home page"
          >
            Back to Home
          </Link>
          <Link
            to="/signup"
            className="aboutus-header-button aboutus-get-started-button"
            aria-label="Sign up for MedLens"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="aboutus-section">
        <h2 className="aboutus-section-title">Our Mission</h2>
        <div className="aboutus-section-content">
          <Heart size={40} color="#ff9800" className="aboutus-section-icon" />
          <p>
            Our mission is to provide seamless access to healthcare services,
            connecting patients with doctors, pharmacies, and advanced
            diagnostic tools to improve lives worldwide.
          </p>
        </div>
      </div>

      <div className="aboutus-section">
        <h2 className="aboutus-section-title">Our Vision</h2>
        <div className="aboutus-section-content">
          <Award size={40} color="#1f61a8" className="aboutus-section-icon" />
          <p>
            We envision a world where healthcare is accessible, efficient, and
            powered by cutting-edge technology, ensuring everyone receives the
            care they deserve.
          </p>
        </div>
      </div>

      <div className="aboutus-section">
        <h2 className="aboutus-section-title">Our Project</h2>
        <div className="aboutus-section-content">
          <Users size={40} color="#03a9f4" className="aboutus-section-icon" />
          <p>
            MedLens is our graduation project for the final year at the
            Engineering Faculty. Developed by a dedicated team of students, this
            platform integrates AI diagnostics, doctor appointments, and
            pharmacy services to revolutionize healthcare delivery.
          </p>
        </div>
      </div>

      <div className="aboutus-section">
        <h2 className="aboutus-section-title">Our Team</h2>
        <div className="aboutus-team-grid">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="aboutus-team-card"
              aria-labelledby={`aboutus-team-member-${index}`}
            >
              <div className="aboutus-team-card-content">
                <h3
                  id={`aboutus-team-member-${index}`}
                  className="aboutus-team-name"
                >
                  {member.name}
                </h3>
                <p className="aboutus-team-role">{member.role}</p>
                <p className="aboutus-team-bio">{member.bio}</p>
                <div className="aboutus-team-details">
                  <div className="aboutus-team-expertise">
                    <Briefcase size={16} color="#1f61a8" />
                    <span>{member.expertise}</span>
                  </div>
                </div>
                <div className="aboutus-team-email-container">
                  <div className="aboutus-team-email">
                    <Mail size={16} color="#fff" />
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`Email ${member.name}`}
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
