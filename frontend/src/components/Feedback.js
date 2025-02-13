import React from "react";
import { useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "./Feedback.css";

const Feedback = () => {
  const reviews = useSelector((state) => state.feedback.reviews);

  return (
    <section className="feedback-section">
      <div className="container-feedback">
        <h2 className="feedback-title">What Healthcare Professionals Say</h2>
        <p className="feedback-description">
          Discover how MedLens is transforming healthcare practices worldwide
          with AI-powered solutions.
        </p>
        <div className="grid-container">
          {reviews.length > 0 && (
            <div className="large-card">
              <div className="review-card">
                <img
                  src={reviews[0].image}
                  alt={reviews[0].name}
                  className="review-avatar large-avatar"
                />
                <div className="review-content">
                  <h3 className="review-name">{reviews[0].name}</h3>
                  <p className="review-title">{reviews[0].title}</p>
                  <blockquote className="review-text">
                    "{reviews[0].feedback}"
                  </blockquote>
                  <div className="review-footer">
                    {" "}
                    <Link href="#" className="read-more">
                      Read full story{" "}
                      <span className="read-arrow"> &#8250;</span>
                    </Link>
                    <p className="review-time">
                      <Clock size={14} color="#666" />
                      {reviews[0].time}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="small-cards">
            {reviews.slice(1).map((review) => (
              <div key={review.id} className="review-card small-card">
                <img
                  src={review.image}
                  alt={review.name}
                  className="review-avatar"
                />
                <div className="review-content">
                  <h3 className="review-name">{review.name}</h3>
                  <p className="review-title">{review.title}</p>
                  <blockquote className="review-text">
                    "{review.feedback}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
