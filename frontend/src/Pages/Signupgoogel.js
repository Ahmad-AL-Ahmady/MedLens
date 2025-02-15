import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "./LocationPicker"; // Import the map component
import { CiLocationOn } from "react-icons/ci";
import { Bot, Calendar, MapPin, Stethoscope } from "lucide-react";
import whiteLogo from "../assets/images/Whitelogo.png";
import "../Styles/SignupGoogel.css";

function GoogleSignUpForm() {
  const [userType, setUserType] = useState("patient");
  const [gender, setGender] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="signup-googel-container">
      <div className="googel-form-container">
        <div className="googel-form-content">
          <div className="google-logo">
            <span className="G">G</span>
            <span className="o1">o</span>
            <span className="o2">o</span>
            <span className="g">g</span>
            <span className="l">l</span>
            <span className="e">e</span>
          </div>

          <h1 className="google-auth-title">Create your Account with Google</h1>
          <form className="google-auth-form" onSubmit={handleSubmit}>
            <div className="user-type-selection">
              {["patient", "doctor", "pharmacy"].map((type) => (
                <label
                  key={type}
                  className={`user-type-label ${
                    userType === type ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={type}
                    checked={userType === type}
                    onChange={(e) => setUserType(e.target.value)}
                    className="hidden-radio"
                  />
                  <span className="user-type-text">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            <div class="dob-input-group">
              <div class="dob-input-wrapper">
                <input type="date" class="dob-input" id="birthdate" required />{" "}
              </div>
            </div>
            {/* Gender Selection */}
            {/* Gender & Location Row */}
            <div className="gender-location-row">
              {/* Gender Selection */}
              <div className="gender-selection">
                {["male", "female"].map((genderOption) => (
                  <label
                    key={genderOption}
                    className={`gender-label ${
                      gender === genderOption ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={genderOption}
                      checked={gender === genderOption}
                      onChange={(e) => setGender(e.target.value)}
                      className="hidden-radio"
                    />
                    {genderOption.charAt(0).toUpperCase() +
                      genderOption.slice(1)}
                  </label>
                ))}
              </div>

              {/* Location Picker */}
              {["doctor", "pharmacy"].includes(userType) && (
                <div className="location-container">
                  <button
                    type="button"
                    className="location-button"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <CiLocationOn className="location-icon" />
                    {location ? "Location Selected" : "Select Location"}
                  </button>
                </div>
              )}
            </div>
            {showMap && (
              <LocationPicker
                onSelect={setLocation}
                onClose={() => setShowMap(false)}
              />
            )}{" "}
            <div className="terms-container">
              <input id="terms" name="terms" type="checkbox" required />
              <label htmlFor="terms">
                I agree to the Terms and Privacy Policy
              </label>
            </div>
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>
          <p className="login-link">
            Already have an account?{" "}
            <Link to="/login" className="link-text">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-side-container">
        <div className="auth-side-overlay" />
        <div className="auth-side-content">
          <div className="auth-side-logo">
            <img src={whiteLogo} alt="Logo" />
            <span className="auth-side-logo-text">MedLens</span>
          </div>
          <h2 className="feature-title">Welcom back</h2>
          <div className="feature-list">
            {[
              {
                Icon: Bot,
                title: "AI-Powered Diagnosis",
                desc: "Get AI-driven diagnosis",
              },
              {
                Icon: Calendar,
                title: "Easy Scheduling",
                desc: "Book appointments",
              },
              {
                Icon: MapPin,
                title: "Online Pharmacy",
                desc: "Order medications",
              },
              {
                Icon: Stethoscope,
                title: "Virtual Consultations",
                desc: "Consult doctors online",
              },
            ].map(({ Icon, title, desc }, idx) => (
              <div key={idx} className="feature-item">
                <Icon className="feature-icon" />
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleSignUpForm;
