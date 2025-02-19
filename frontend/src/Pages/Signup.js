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
  const [specialization, setSpecialty] = useState("");
  const [error, setError] = useState("");
  const medicalSpecialties = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "General Surgery",
    "Anesthesiology",
    "Radiology",
    "Psychiatry",
    "Obstetrics/Gynecology",
    "ENT (Ear, Nose & Throat)",
  ];
  const handleGoogleSignup = () => {
    navigate("/signup-google"); // Or your Google signup page route
  };
  const calculateAge = (birthDate) => {
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.get("terms")) {
      setError("Please agree to the terms and privacy policy");
      return;
    }

    const birthDate = formData.get("birthdate");
    const age = calculateAge(birthDate);

    // Ensure location is valid if userType requires it
    if (["doctor", "pharmacy"].includes(userType)) {
      if (
        !location ||
        location.lng === undefined ||
        location.lat === undefined
      ) {
        setError("Please select a valid location");
        console.error("Invalid location:", location);
        return;
      }
    }

    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password,
      passwordConfirm: confirmPassword,
      userType: userType.charAt(0).toUpperCase() + userType.slice(1),
      age,
      gender,
      ...(userType === "doctor" && { specialization }),
      ...(["doctor", "pharmacy"].includes(userType) && location
        ? {
            location: {
              type: "Point",
              coordinates: [location.lng, location.lat], // Make sure these exist
            },
          }
        : {}),
    };

    console.log("Submitting data:", data); // Debugging log

    try {
      const response = await fetch("http://127.0.0.1:4000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Signup failed");
      }

      navigate("/verify-email-instructions");
    } catch (err) {
      setError(err.message || "Signup failed");
      console.error("Signup error:", err);
    }
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
          <form className="signup-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
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
            <div className="dob-input-group">
              <div className="dob-input-wrapper">
                <input
                  type="date"
                  className="dob-input"
                  id="birthdate"
                  name="birthdate"
                  required
                />{" "}
              </div>
            </div>
            {/* Gender Selection */}
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
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
            {userType === "doctor" && (
              <div className="input-group">
                <select
                  id="specialty"
                  name="specialty"
                  value={specialization}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="specialty-select"
                >
                  <option value="">Select Medical Specialty</option>
                  {medicalSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
