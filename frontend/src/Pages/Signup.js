import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  FaStethoscope,
  FaCalendarAlt,
  FaMedkit,
  FaRobot,
} from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import LocationPicker from "./LocationPicker"; // Import the map component
import "../Styles/Signup.css";
import whiteLogo from "../assets/images/Whitelogo.png";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate

function SignUpForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("patient");
  const [gender, setGender] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const handleGoogleSignup = () => {
    navigate("/signup-google"); // Or your Google signup page route
  };
  return (
    <div className="signup-container">
      <div className="form-container">
        <div className="form-content">
          <div>
            <h1 className="title">Create Account</h1>
            <p className="subtitle">
              Join MedLens for smart healthcare solutions
            </p>
          </div>
          <div className="auth-options">
            <button className="google-button" onClick={handleGoogleSignup}>
              <FcGoogle className="icon" />
              Sign up with Google
            </button>
            <div className="separator">
              <span>Or continue with</span>
            </div>
          </div>
          <form className="signup-form">
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
            <div className="input-group">
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                required
              />
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                required
              />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              required
            />
            {/* Replace Age input with this */}
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
            )}
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              required
            />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Confirm Password"
              required
            />
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

      {/* Side Info Section */}
      <div className="info-container">
        <div className="info-content">
          <div className="logo-container">
            <img src={whiteLogo} alt="MedLens Logo" className="info-logo" />
            <h1 className="logo-text">MedLens</h1>
          </div>
          <h2 className="info-title">Experience Smart Healthcare</h2>
          <div className="info-list">
            {[
              {
                title: "AI-Powered Diagnosis",
                desc: "Get preliminary diagnoses using AI technology",
                icon: <FaRobot className="info-icon" />,
              },
              {
                title: "Easy Scheduling",
                desc: "Book appointments with professionals",
                icon: <FaCalendarAlt className="info-icon" />,
              },
              {
                title: "Online Pharmacy",
                desc: "Order medications with home delivery",
                icon: <FaMedkit className="info-icon" />,
              },
              {
                title: "Virtual Consultations",
                desc: "Connect with doctors from home",
                icon: <FaStethoscope className="info-icon" />,
              },
            ].map((item) => (
              <div key={item.title} className="info-item">
                <h3 className="info-item-title">
                  {item.icon}
                  {item.title}
                </h3>
                <p className="info-item-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
