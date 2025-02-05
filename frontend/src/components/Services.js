import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./Services.css";

const Services = () => {
  const services = useSelector((state) => state.services) || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const nextSlide = () => {
    if (currentIndex + 1 <= services.length - itemsPerPage) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <section className="services">
      <div className="services-header">
        <h3>A Medical System Based On Care And Communication</h3>
        <div className="carousel-buttons">
          <button
            className="arrow left"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            {" "}
            ❮{" "}
          </button>
          <button
            className="arrow right"
            onClick={nextSlide}
            disabled={currentIndex + itemsPerPage >= services.length}
          >
            {" "}
            ❯{" "}
          </button>
        </div>
      </div>
      <div className="services-wrapper">
        <div
          className="services-container"
          style={{
            transform: `translateX(-${currentIndex * 320}px) `,
          }}
        >
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <img src={service.image} alt={service.title} />
              <h3>
                {service.icon}
                {service.title}
              </h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
