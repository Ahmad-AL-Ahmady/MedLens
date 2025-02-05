import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectOpinions } from "../redux/opinionSlice";
import "./Testimonials.css";

const Testimonials = () => {
  const opinions = useSelector(selectOpinions);
  const [startIndex, setStartIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCardsPerPage(1);
      } else if (window.innerWidth <= 1024) {
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    if (startIndex + cardsPerPage < opinions.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2>What Our Patients Say About Us</h2>
        <div className="arrows-T">
          <button
            className="arrow-T left"
            onClick={prevSlide}
            disabled={startIndex === 0}
          >
            ❮
          </button>
          <button
            className="arrow-T right"
            onClick={nextSlide}
            disabled={startIndex + cardsPerPage >= opinions.length}
          >
            ❯
          </button>
        </div>
      </div>

      <div className="testimonials-container">
        {opinions
          .slice(startIndex, startIndex + cardsPerPage)
          .map((opinion, index) => (
            <div key={index} className="testimonial-card">
              <img
                src={opinion.image}
                alt={opinion.name}
                className="profile-pic"
              />
              <div className="testimonial-content">
                <h3 className="name">{opinion.name}</h3>
                <p className="rating">{opinion.rating}</p>
                <p className="feedback">{opinion.text}</p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default Testimonials;
