import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "./LocationPicker"; // Import the map component
import { CiLocationOn } from "react-icons/ci";
import InfoSection from "../components/InfoSection";
import "../Styles/SignupGoogel.css";

function GoogleSignUpForm() {
  const [userType, setUserType] = useState("patient");
  const [gender, setGender] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form location data:", location);
  };
  useEffect(() => {
    if (location) {
      console.log("Selected location:", location);
    }
  }, [location]);

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
            <div className="googel-user-type-selection">
              {["patient", "doctor", "pharmacy"].map((type) => (
                <label
                  key={type}
                  className={`googel-user-type-label ${
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
            <div className="googel-dob-input-group">
              <div className="googel-dob-input-wrapper">
                <input
                  type="date"
                  className="googel-dob-input"
                  id="birthdate"
                  required
                />{" "}
              </div>
            </div>
            {/* Gender Selection */}
            {/* Gender & Location Row */}
            <div className="googel-gender-location-row">
              {/* Gender Selection */}
              <div className="googel-gender-selection">
                {["male", "female"].map((genderOption) => (
                  <label
                    key={genderOption}
                    className={`googel-gender-label ${
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
                <div className="googe-location-container">
                  <button
                    type="button"
                    className="googel-location-button"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <CiLocationOn className="googel-location-icon" />
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
            <div className="googel-terms-container">
              <input id="terms" name="terms" type="checkbox" required />
              <label htmlFor="terms">
                I agree to the Terms and Privacy Policy
              </label>
            </div>
            <button type="submit" className="googel-signup-button">
              Sign Up
            </button>
          </form>
          <p className="googel-login-link">
            Already have an account?{" "}
            <Link to="/login" className="googel-link-text">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <InfoSection />
    </div>
  );
}

export default GoogleSignUpForm;
