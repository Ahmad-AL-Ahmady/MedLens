import React from "react";
import { useSelector } from "react-redux";
import "./Testimonials.css";

const Testimonials = () => {
  const testimonials = useSelector((state) => state.testimonials.testimonials);

  return (
    <section className="testimonials">
      <h2>What Our Users Say</h2>
      <div className="testimonials-container">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial">
            <div className="user-info">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="avatar"
              />
              <div>
                <div className="name">{testimonial.name}</div>
                <div className="role">{testimonial.role}</div>
              </div>
            </div>
            <p className="feedback">“{testimonial.feedback}”</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
