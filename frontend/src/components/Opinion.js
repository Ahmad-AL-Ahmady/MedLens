import React from "react";
import "./Opinion.css";
import Testimonials from "./Testimonials";
import opinion from "../assets/images/opinion.jpg";
const Opinion = () => {
  return (
    <section className="opinion-section">
      <div className="opinion-container">
        <div className="opinion-image">
          <img src={opinion} alt="Doctor" />
        </div>

        <div className="opinion-text">
          <h1>Quality Care For You And Your Loved Ones</h1>
          <p className="descreption">
            Advanced Medical Care You Can Trust. With top specialists and the
            latest innovations, we ensure quality treatment and peace of mind
            for you and your loved ones.
          </p>
        </div>
      </div>

      <div className="testimonials">
        <Testimonials />
      </div>
    </section>
  );
};

export default Opinion;
