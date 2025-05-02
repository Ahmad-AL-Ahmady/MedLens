import React from "react";
import { Link } from "react-router-dom";
import { Stethoscope, Search, Upload, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Styles/ServicesPage.css";

export default function ServicesPage() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Find a Doctor",
      description:
        "Search for specialized doctors by location, specialization, or name. Browse detailed profiles, read patient reviews, and book appointments instantly with top healthcare professionals. Filter by availability, insurance, or telehealth options to find the perfect match for your needs.",
      icon: <Stethoscope size={48} color="#1e3a8a" />,
      path: "/doctors",
    },
    {
      title: "Pharmacy Search",
      description:
        "Locate nearby pharmacies with ease. Find medicines, check real-time stock availability, compare prices, and access detailed information on generics and alternatives. Get directions, contact details, and 24/7 pharmacy options for urgent needs.",
      icon: <Search size={48} color="#3b82f6" />,
      path: "/pharmacy",
    },
    {
      title: "X-Ray Scan Analysis",
      description:
        "Upload X-ray images for AI-powered analysis. Receive instant insights, detailed medical reports, and preliminary findings within minutes. Share results with your doctor securely and access expert consultations for further evaluation.",
      icon: <Upload size={48} color="#f59e0b" />,
      path: "/scan",
    },
    {
      title: "Health Monitoring",
      description:
        "Manage your healthcare in one place. Track appointments, store medical scans, monitor vitals, and receive reminders for check-ups. Access your health records securely, share them with providers, and stay proactive about your wellness.",
      icon: <HeartPulse size={48} color="#dc2626" />,
      path: "/dashboard",
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleKeyDown = (e, path) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="services-page">
      <div className="services-hero">
        <h1 className="services-title">Our Healthcare Services</h1>
        <p className="services-subtitle">
          Explore innovative solutions designed to simplify and enhance your
          healthcare experience.
        </p>
      </div>
      <div className="services-header">
        <div className="services-header-buttons">
          <Link
            to="/"
            className="services-header-button services-home-button"
            aria-label="Return to home page"
          >
            Back to Home
          </Link>
          <Link
            to="/signup"
            className="services-header-button services-get-started-button"
            aria-label="Sign up for MedLens"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="services-section">
        <h2 className="services-section-title">What We Offer</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="services-service-card"
              role="link"
              tabIndex={0}
              onClick={() => handleCardClick(service.path)}
              onKeyDown={(e) => handleKeyDown(e, service.path)}
              aria-labelledby={`services-service-${index}`}
            >
              <div className="services-service-card-content">
                <div className="services-service-icon">{service.icon}</div>
                <h3
                  id={`services-service-${index}`}
                  className="services-service-title"
                >
                  {service.title}
                </h3>
                <p className="services-service-description">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
