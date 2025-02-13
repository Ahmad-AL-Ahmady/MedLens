import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./FAQ.css";

const PlusIcon = () => (
  <svg className="faq-icon" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="blue" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="2" />
  </svg>
);

const MinusIcon = () => (
  <svg className="faq-icon" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="blue" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="2" />
  </svg>
);

const FAQ = () => {
  const faqs = useSelector((state) => state.faq.faqs);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <span>{faq.question}</span>
              <div className="faq-icon-wrapper">
                {openFaq === index ? <MinusIcon /> : <PlusIcon />}
              </div>
            </button>
            {openFaq === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
