import React from "react";
import { useSelector } from "react-redux";
import "./HowItWorks.css";

const HowItWorks = () => {
  const steps = useSelector((state) => state.howItWorks.steps);

  return (
    <section className="how-it-works">
      <div className="how-it-works-overlay">
        <h2>How It Works</h2>
        <p>Get started with MedLens in three simple steps</p>
      </div>
      <div className="steps">
        {steps.map((step) => (
          <div key={step.number} className="step">
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
