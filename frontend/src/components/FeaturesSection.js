import React from "react";
import { useSelector } from "react-redux";
import "./FeaturesSection.css";

const FeaturesSection = () => {
  const features = useSelector((state) => state.features.items);

  return (
    <section className="features-section" id="features">
      <div className="container">
        <h2 className="section-title">Comprehensive Healthcare Platform</h2>
        <p className="section-description">
          Revolutionizing healthcare delivery with AI-powered diagnosis and
          integrated appointment management.
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`feature-card ${index === 0 ? "first-card" : ""}`}
            >
              <div className="icon-container">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
