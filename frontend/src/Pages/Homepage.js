import React from "react";
import { useState } from "react";

import {
  Brain,
  Stethoscope,
  Calendar,
  Store,
  Shield,
  ChevronRight,
  MinusCircle,
  PlusCircle,
  Mail,
  Pill,
} from "lucide-react";
import "../Styles/Homepage.css";
import { useNavigate } from "react-router-dom";
import WhiteLogo from "../assets/images/Whitelogo.png";
export default function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      text: `"The AI diagnosis assistance has dramatically improved my ability to make accurate diagnoses quickly."`,
      avatar: "https://mighty.tools/mockmind-api/content/human/97.jpg",
    },
    {
      name: "Michael Chen",
      role: "Patient",
      text: `"Booking appointments and getting prescriptions has never been easier. This platform is a game-changer."`,
      avatar: "https://mighty.tools/mockmind-api/content/human/57.jpg",
    },
    {
      name: "Lisa Thompson",
      role: "Pharmacist",
      text: `"The pharmacy management system has streamlined our inventory and improved customer service."`,
      avatar: "https://mighty.tools/mockmind-api/content/human/108.jpg",
    },
  ];

  const faqs = [
    {
      question: "How accurate is the AI diagnosis?",
      answer:
        "Our AI system has achieved 99.9% accuracy in initial diagnoses, verified by medical professionals.",
    },
    {
      question: "Is my medical data secure?",
      answer:
        "Yes, we use enterprise-grade encryption and are fully HIPAA compliant to protect your medical information.",
    },
    {
      question: "How do I book an appointment?",
      answer:
        "Simply select a doctor from our network, choose an available time slot, and confirm your booking.",
    },
  ];
  // Update testimonials2 structure
  const testimonials2 = {
    main: [
      {
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop",
        name: "Dr. Emily Richardson",
        role: "Chief of Medicine, Metro Hospital",
        content: `"As someone who's been practicing medicine for over 15 years, I was initially skeptical about AI in healthcare. But MedCal has completely transformed how we diagnose and treat patients. The accuracy and speed of the AI diagnostics are remarkable, and the integrated appointment system has streamlined our entire practice."`,
      },
      {
        image: "https://mighty.tools/mockmind-api/content/human/99.jpg",
        name: "Dr. Michael Chen",
        role: "Neurology Director",
        content: `"The platform has reduced our administrative workload by 40%. Now we can focus more on patient care."`,
      },
      {
        image: "https://mighty.tools/mockmind-api/content/human/118.jpg",
        name: "Dr. Sophia Adams",
        role: "Oncology Specialist",
        content: `"MedCal's treatment recommendation system has become an indispensable tool for our cancer care team."`,
      },
      {
        image:
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop",
        name: "Dr. Raj Patel",
        role: "Cardiac Surgeon",
        content: `"The surgical outcome predictions have helped us reduce complications by 40% in cardiac procedures."`,
      },
      {
        image:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop",
        name: "Dr. James Wilson",
        role: "Pediatrician",
        content: `"The pediatric-specific features have been invaluable for managing childhood vaccinations and growth tracking."`,
      },
    ],
    // Add other secondary testimonials as needed

    stats: [
      { number: "98%", label: "Satisfaction Rate" },
      { number: "4.9/5", label: "Average Rating" },
      { number: "15k+", label: "Reviews" },
      { number: "50+", label: "Countries" },
    ],
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials2.main.length);
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? testimonials2.main.length - 1 : prev - 1
    );
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };
  return (
    <div className="home-main-container">
      <nav className="home-navbar">
        <div className="home-nav-content">
          <div className="home-logo" onClick={() => navigate("/")}>
            <img src={WhiteLogo} alt="MedLens Logo" className="home-logo-img" />
            <span className="home-logo-text">MedLens</span>
          </div>

          <div className="home-nav-buttons">
            {["Services", "About Us", "Careers", "News"].map((item) => (
              <button
                key={item}
                className="home-nav-button"
                onClick={() =>
                  navigate(`/${item.toLowerCase().replace(" ", "-")}`)
                }
              >
                {item}
                <span className="nav-button-underline"></span>
              </button>
            ))}
          </div>

          <button
            className="home-contact-btn"
            onClick={() => navigate("/login")}
          >
            <span>Login</span>
            <svg className="login-icon" viewBox="0 0 24 24">
              <path d="M20 12l-6.4 6.4-1.4-1.4 3.6-3.6H4v-2h12.8l-3.6-3.6 1.4-1.4L20 12z" />
            </svg>
          </button>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-background">
          <img
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2000"
            alt="Medical Background"
          />
          <div className="home-hero-overlay"></div>
        </div>
        <div className="home-hero-content">
          <h1>
            Advanced AI for
            <br />
            Modern Healthcare
            <br />
            Solutions
          </h1>
          <p>
            Empowering medical professionals with cutting-edge AI technology for
            better diagnosis and patient care.
          </p>
          <div className="home-cta-buttons">
            <button
              className="home-primary-btn"
              onClick={() => navigate("/signup")}
            >
              Sign up
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="home-features-section">
        <div className="home-feature-container">
          <h2 className="home-feature-heading">
            Comprehensive Healthcare Platform
          </h2>
          <p className="home-feature-text">
            Revolutionizing healthcare delivery with AI-powered diagnosis and
            integrated appointment management.
          </p>
          <div className="home-feature-layout">
            {/* AI Disease Diagnosis */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Brain className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">AI Disease Diagnosis</h3>
              <p className="home-feature-card-text">
                Advanced AI algorithms provide accurate disease diagnosis and
                treatment recommendations based on symptoms and medical history.
              </p>
            </div>

            {/* Book Doctor Appointments */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Stethoscope className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">
                Book Doctor Appointments
              </h3>
              <p className="home-feature-card-text">
                Easily schedule appointments with qualified healthcare
                professionals in your area.
              </p>
            </div>

            {/* Medicine Purchase */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Pill className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">Medicine Purchase</h3>
              <p className="home-feature-card-text">
                Find and locate prescribed medications from nearby pharmacies
                with real-time availability.
              </p>
            </div>

            {/* Doctor's Dashboard */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Calendar className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">Doctor's Dashboard</h3>
              <p className="home-feature-card-text">
                Comprehensive appointment management system for healthcare
                providers to organize their practice.
              </p>
            </div>

            {/* Pharmacy Portal */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Store className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">Pharmacy Portal</h3>
              <p className="home-feature-card-text">
                Digital inventory management system for pharmacies to list and
                update medicine availability.
              </p>
            </div>

            {/* Secure & Compliant */}
            <div className="home-feature-card">
              <div className="home-feature-icon-box">
                <Shield className="home-feature-icon" />
              </div>
              <h3 className="home-feature-card-title">Secure & Compliant</h3>
              <p className="home-feature-card-text">
                HIPAA-compliant platform ensuring the security and privacy of
                all medical data and transactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="home-state-section">
        <div className="home-state-container">
          <div>
            <div className="home-state-value">99.9%</div>
            <div className="home-state-title">Diagnosis Accuracy</div>
          </div>
          <div>
            <div className="home-state-value">50,000+</div>
            <div className="home-state-title">Medical Professionals</div>
          </div>
          <div>
            <div className="home-state-value">1M+</div>
            <div className="home-state-title">Patients Helped</div>
          </div>
        </div>
      </section>
      <section class="home-How-section">
        <div class="home-How-container">
          <h2 class="home-How-title">How It Works</h2>
          <p class="home-How-steps">Simple steps to get started</p>
          <div class="home-how-step-container">
            <div class="home-how-step-card">
              <div class="home-how-step-number">1</div>
              <h3 class="home-how-step-heading">Input Symptoms</h3>
              <p class="home-how-step-text">
                Enter your symptoms and medical history into our AI-powered
                system.
              </p>
            </div>
            <div class="home-how-step-card">
              <div class="home-how-step-number">2</div>
              <h3 class="home-how-step-heading">Get AI Analysis</h3>
              <p class="home-how-step-text">
                Our advanced AI analyzes your information and provides potential
                diagnoses..
              </p>
            </div>
            <div class="home-how-step-card">
              <div class="home-how-step-number">3</div>
              <h3 class="home-how-step-heading">Connect with Doctors</h3>
              <p class="home-how-step-text">
                Book appointments with specialists based on the AI
                recommendations..
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="home-testimonials-section">
        <div className="home-testimonials-container">
          <h2 className="home-testimonials-heading">What Our Users Say</h2>
          <div className="home-testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="home-testimonial-card">
                <div className="home-testimonial-header">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="home-testimonial-avatar"
                  />
                  <div className="home-testimonial-info">
                    <div className="home-testimonial-name">
                      {testimonial.name}
                    </div>
                    <div className="home-testimonial-role">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="home-testimonial-text">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="home-faq-section">
        <div className="home-faq-container">
          <h2 className="home-faq-heading">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="home-faq-item">
                <button
                  className="home-faq-button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="home-faq-question">{faq.question}</span>
                  {openFaq === index ? (
                    <MinusCircle className="home-faq-icon" />
                  ) : (
                    <PlusCircle className="home-faq-icon" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="home-faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="home-cta-section">
        <div className="home-cta-container">
          <h2 className="home-cta-heading">
            Ready to Transform Your Healthcare Practice?
          </h2>
          <p className="home-cta-text">
            Join thousands of healthcare professionals already using MedCal
          </p>
          <div className="home-cta-button">
            <button
              className="home-cta-primary"
              onClick={() => navigate("/signup")}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
      <section className="home-testimonials-slider-section">
        <div className="home-testimonials-slider-container">
          <div className="home-testimonials-slider-header">
            <h2 className="home-testimonials-slider-title">
              What Healthcare Professionals Say
            </h2>
            <p className="home-testimonials-slider-subtitle">
              Discover how MedCal is transforming healthcare practices worldwide
            </p>
          </div>

          <div className="home-testimonials-slider-slider">
            <div className="home-testimonials-slider-wrapper">
              {testimonials2.main.map((testimonial, index) => (
                <div
                  key={index}
                  className={`home-testimonials-slide ${
                    index === activeIndex ? "active" : ""
                  }`}
                  aria-hidden={index !== activeIndex}
                >
                  <div className="home-testimonials-slider-card">
                    <div className="home-testimonials-slider-author-meta">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="home-testimonials-slider-author-image"
                      />
                      <div className="home-testimonials-slider-author-info">
                        <div className="home-testimonials-slider-rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="home-testimonials-slider-star-icon"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <h3 className="home-testimonials-slider-author-name">
                          {testimonial.name}
                        </h3>
                        <p className="home-testimonials-slider-author-role">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <blockquote className="home-testimonials-slider-testimonial-text">
                      {testimonial.content}
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            <div className="home-testimonials-slider-controls">
              <button
                className="home-testimonials-slider-prev-button"
                onClick={goPrev}
                aria-label="Previous testimonial"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                </svg>
              </button>

              <div className="home-testimonials-slider-dots-container">
                {testimonials2.main.map((_, index) => (
                  <button
                    key={index}
                    className={`home-testimonials-slider-dot ${
                      index === activeIndex ? "active" : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button
                className="home-testimonials-slider-next-button"
                onClick={goNext}
                aria-label="Next testimonial"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="home-testimonials-slider-stats-grid">
            {" "}
            {/* Fixed typo in class name */}
            {testimonials2.stats.map((stat, index) => (
              <div key={index} className="home-testimonials-slider-stat-item">
                <div className="home-testimonials-slider-stat-number">
                  {stat.number}
                </div>
                <p className="home-testimonials-slider-stat-label">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-grid">
            {/* Company Info */}
            <div className="home-footer-section">
              <div className="home-footer-logo">MedLens</div>
              <p className="home-footer-description">
                Revolutionizing healthcare with AI-powered solutions for better
                patient care and medical diagnosis.
              </p>
            </div>

            {/* Quick Links */}
            <div className="home-footer-section">
              <h3 className="home-footer-heading">Quick Links</h3>
              <ul className="home-footer-list">
                {["About Us", "Services"].map((link) => (
                  <li key={link}>
                    <button
                      className="home-footer-link"
                      onClick={() =>
                        navigate(
                          `/${link
                            .toLowerCase()
                            .replace(" & ", "-")
                            .replace(" ", "-")}`
                        )
                      }
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="home-footer-section">
              <h3 className="home-footer-heading">Contact</h3>
              <ul className="home-footer-list">
                <li className="home-contact-item">
                  <Mail size={20} />
                  <span>contact@medcal.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="home-footer-bottom">
          <div className="home-footer-bottom-content">
            <div className="home-footer-copyright">
              © 2024 MedCal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
