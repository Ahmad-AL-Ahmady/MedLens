import React from "react";
import { useSelector } from "react-redux";
import { selectHero } from "../redux/heroSlice";
import "./HeroSection.css";

const HeroSection = () => {
  const hero = useSelector(selectHero);

  return (
    <section className="hero-container">
      <div className="hero-overlay"></div>
      <img
        src={hero.backgroundImage}
        alt="Medical Background"
        className="hero-image"
      />
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-buttons">
            <button className="btn-primary">
              {hero.buttonText}
              <span className="arrow"> &#8250;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
