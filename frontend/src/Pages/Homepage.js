import React from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Stethoscope,
  Calendar,
  Store,
  Shield,
  ChevronRight,
} from "lucide-react";
import "../Styles/Homepage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">MedCal</div>
          <div className="nav-links">
            <span href="#">Services</span>
            <span href="#">Case Studies</span>
            <span href="#">About Us</span>
            <span href="#">Careers</span>
            <span href="#">News</span>
          </div>
          <button className="contact-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-background">
          <img
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2000"
            alt="Medical Background"
          />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="tag">/ CASE STUDY</div>
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
          <div className="cta-buttons">
            <button className="primary-btn">
              Start Free Trial
              <ChevronRight />
            </button>
            <button className="secondary-btn">Watch Demo</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-container">
          <h2 className="feature-heading">Comprehensive Healthcare Platform</h2>
          <p className="feature-text">
            Revolutionizing healthcare delivery with AI-powered diagnosis and
            integrated appointment management.
          </p>
          <div className="feature-layout">
            {/* AI Disease Diagnosis */}
            <div className="card">
              <div className="icon-box">
                <Brain className="icon" />
              </div>
              <h3 className="card-title">AI Disease Diagnosis</h3>
              <p className="card-text">
                Advanced AI algorithms provide accurate disease diagnosis and
                treatment recommendations based on symptoms and medical history.
              </p>
            </div>

            {/* Book Doctor Appointments */}
            <div className="card">
              <div className="icon-box">
                <Stethoscope className="icon" />
              </div>
              <h3 className="card-title">Book Doctor Appointments</h3>
              <p className="card-text">
                Easily schedule appointments with qualified healthcare
                professionals in your area.
              </p>
            </div>

            {/* Medicine Purchase */}
            <div className="card">
              <div className="icon-box">
                <div className="icon" />
              </div>
              <h3 className="card-title">Medicine Purchase</h3>
              <p className="card-text">
                Find and purchase prescribed medications from nearby pharmacies
                with real-time availability.
              </p>
            </div>

            {/* Doctor's Dashboard */}
            <div className="card">
              <div className="icon-box">
                <Calendar className="icon" />
              </div>
              <h3 className="card-title">Doctor's Dashboard</h3>
              <p className="card-text">
                Comprehensive appointment management system for healthcare
                providers to organize their practice.
              </p>
            </div>

            {/* Pharmacy Portal */}
            <div className="card">
              <div className="icon-box">
                <Store className="icon" />
              </div>
              <h3 className="card-title">Pharmacy Portal</h3>
              <p className="card-text">
                Digital inventory management system for pharmacies to list and
                update medicine availability.
              </p>
            </div>

            {/* Secure & Compliant */}
            <div className="card">
              <div className="icon-box">
                <Shield className="icon" />
              </div>
              <h3 className="card-title">Secure & Compliant</h3>
              <p className="card-text">
                HIPAA-compliant platform ensuring the security and privacy of
                all medical data and transactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="state-section">
        <div className="state-container">
          <div>
            <div className="state-value">99.9%</div>
            <div className="state-title">Diagnosis Accuracy</div>
          </div>
          <div>
            <div className="state-value">50,000+</div>
            <div className="state-title">Medical Professionals</div>
          </div>
          <div>
            <div className="state-value">1M+</div>
            <div className="state-title">Patients Helped</div>
          </div>
        </div>
      </section>
      <section class="How-section">
        <div class="How-container">
          <h2 class="How-title">How It Works</h2>
          <p class="How-steps">Simple steps to get started</p>
          <div class="step-container">
            <div class="step-card">
              <div class="step-number">1</div>
              <h3 class="step-heading">Input Symptoms</h3>
              <p class="step-text">
                Enter your symptoms and medical history into our AI-powered
                system.
              </p>
            </div>
            <div class="step-card">
              <div class="step-number">2</div>
              <h3 class="step-heading">Get AI Analysis</h3>
              <p class="step-text">
                Our advanced AI analyzes your information and provides potential
                diagnoses..
              </p>
            </div>
            <div class="step-card">
              <div class="step-number">3</div>
              <h3 class="step-heading">Connect with Doctors</h3>
              <p class="step-text">
                Book appointments with specialists based on the AI
                recommendations..
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
