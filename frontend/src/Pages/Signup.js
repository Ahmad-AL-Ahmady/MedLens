import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { CiLocationOn } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 for professional alerts
import InfoSection from "../components/InfoSection";
import LocationPicker from "./LocationPicker";
import "../Styles/Signup.css";

function SignUpForm() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("patient");
  const [gender, setGender] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);
  const [specialization, setSpecialty] = useState("");

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
    "ENT",
  ];

  // Calculate age based on birth date
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

  // Handle Google signup redirection
  const handleGoogleSignup = () => {
    navigate("/signup-google");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const password = formData.get("password");
      const confirmPassword = formData.get("confirmPassword");

      // Validation: Password mismatch
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validation: Password length
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Validation: Terms agreement
      if (!formData.get("terms")) {
        throw new Error("Please agree to the terms and privacy policy");
      }

      // Validation: Location for doctor/pharmacy
      const birthDate = formData.get("birthdate");
      const age = calculateAge(birthDate);

      if (["doctor", "pharmacy"].includes(userType)) {
        if (!location || !location.type || !location.coordinates) {
          throw new Error("Please select a valid location");
        }
      }

      // Validation: Email format (client-side)
      const email = formData.get("email");
      if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        throw new Error("Invalid email address format");
      }

      // Validation: First and last name (basic check for letters only)
      const firstName = formData.get("firstName");
      const lastName = formData.get("lastName");
      if (!firstName.match(/^[a-zA-Z]+$/)) {
        throw new Error("First name must only contain letters");
      }
      if (!lastName.match(/^[a-zA-Z]+$/)) {
        throw new Error("Last name must only contain letters");
      }

      // Prepare data for API request
      const data = {
        firstName,
        lastName,
        email,
        password,
        passwordConfirm: confirmPassword,
        userType: userType.charAt(0).toUpperCase() + userType.slice(1),
        age,
        gender,
        ...(userType === "doctor" && { specialization }),
        ...(["doctor", "pharmacy"].includes(userType) && location
          ? { location }
          : {}),
      };

      console.log("Submitting data:", data);

      // Make API request
      const response = await fetch("http://localhost:4000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const responseData = await response.json().catch(() => {
          throw new Error("Server error: Unable to process the request");
        });

        if (response.status === 409) {
          // Conflict: Email already exists
          throw new Error("An account with this email already exists");
        } else if (response.status === 400) {
          // Bad Request: Could be role-specific issues or invalid data
          if (responseData.message.includes("license")) {
            throw new Error(
              userType === "doctor"
                ? "License number is invalid or already registered"
                : "Pharmacy license number is required"
            );
          } else if (responseData.message.includes("national ID")) {
            throw new Error("National ID already exists in the system");
          } else {
            throw new Error(responseData.message || "Signup failed");
          }
        } else {
          throw new Error(responseData.message || "Signup failed");
        }
      }

      // Parse response as JSON
      const responseData = await response.json().catch((error) => {
        throw new Error("Server error: Invalid response format");
      });

      // Navigate to email verification page on success
      navigate("/verify-email-instructions", {
        state: { email: formData.get("email") },
      });

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Signup Successful",
        text: "Please check your email to verify your account!",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          content: "custom-swal-content",
        },
      });
    } catch (error) {
      // Handle all error types with professional alerts
      let title = "Error";
      let text = error.message || "An unexpected error occurred";

      if (error.message.includes("Passwords do not match")) {
        title = "Password Mismatch";
        text = "The passwords you entered do not match. Please try again.";
      } else if (error.message.includes("Password must be at least")) {
        title = "Invalid Password";
        text = "Your password must be at least 8 characters long.";
      } else if (error.message.includes("terms and privacy policy")) {
        title = "Terms Not Accepted";
        text = "You must agree to the terms and privacy policy to sign up.";
      } else if (error.message.includes("select a valid location")) {
        title = "Location Required";
        text = "Please select a valid location for your account.";
      } else if (error.message.includes("Invalid email address format")) {
        title = "Invalid Email";
        text = "Please enter a valid email address.";
      } else if (error.message.includes("must only contain letters")) {
        title = "Invalid Name";
        text = error.message; // "First name must only contain letters" or "Last name must only contain letters"
      } else if (error.message.includes("email already exists")) {
        title = "Email Already Exists";
        text =
          "An account with this email already exists. Please log in or use a different email.";
      } else if (error.message.includes("License number")) {
        title = "Invalid License";
        text = error.message; // "License number is invalid or already registered" or "Pharmacy license number is required"
      } else if (error.message.includes("National ID")) {
        title = "National ID Conflict";
        text = "This National ID is already registered in the system.";
      } else if (error.message.includes("NetworkError")) {
        title = "Network Error";
        text =
          "No internet connection. Please check your network and try again.";
      } else if (error.message.includes("Server error")) {
        title = "Server Error";
        text =
          "We couldn't process your request due to a server issue. Please try again later.";
      } else if (error.message.includes("Invalid response format")) {
        title = "Server Error";
        text =
          "Received an invalid response from the server. Please try again later.";
      } else if (error.message.includes("Request timed out")) {
        title = "Request Timeout";
        text =
          "The request timed out. Please check your internet connection and try again.";
      } else {
        title = "Unexpected Error";
        text = "Something went wrong. Please try again.";
      }

      // Show error alert using SweetAlert2
      Swal.fire({
        icon: "error",
        title: title,
        text: text,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          content: "custom-swal-content",
        },
      });

      console.error("Signup error:", error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-container">
        <div className="signup-form-content">
          <div>
            <h1 className="signup-form-title">Create Account</h1>
            <p className="signup-form-subtitle">
              Join MedLens for smart healthcare solutions
            </p>
          </div>
          <div>
            <button
              className="signup-google-button"
              onClick={handleGoogleSignup}
            >
              <FcGoogle className="signup-icon" />
              Sign up with Google
            </button>
            <div className="signup-separator">
              <span>Or continue with</span>
            </div>
          </div>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-user-type-selection">
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
            <div className="signup-input-group signup-name-group">
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                required
                className="signup-input"
              />
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                required
                className="signup-input"
              />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="signup-input"
            />
            <div className="dob-input-group">
              <div className="signup-dob-input-wrapper">
                <input
                  type="date"
                  className="signup-dob-input"
                  id="birthdate"
                  name="birthdate"
                  required
                />
              </div>
            </div>
            <div className="signup-gender-location-row">
              <div className="signup-gender-selection">
                {["male", "female"].map((genderOption) => (
                  <label
                    key={genderOption}
                    className={`signup-gender-label ${
                      gender === genderOption ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={genderOption}
                      checked={gender === genderOption}
                      onChange={(e) => setGender(e.target.value)}
                      className="hidden-radio signup-input"
                    />
                    {genderOption.charAt(0).toUpperCase() +
                      genderOption.slice(1)}
                  </label>
                ))}
              </div>
              {["doctor", "pharmacy"].includes(userType) && (
                <div className="signup-location-container">
                  <button
                    type="button"
                    className="signup-location-button"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <CiLocationOn className="signup-location-icon" />
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
              className="signup-input"
            />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              className="signup-input"
            />
            {userType === "doctor" && (
              <div className="input-group">
                <select
                  id="specialty"
                  name="specialty"
                  value={specialization}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="signup-specialty-select specialty-select"
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
            <div className="signup-terms-container">
              <input id="terms" name="terms" type="checkbox" required />
              <label htmlFor="terms" className="signup-terms-label">
                I agree to the Terms and Privacy Policy
              </label>
            </div>
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>
          <p className="login-link-signup-form">
            Already have an account?{" "}
            <Link to="/login" className="signup-form-link-text">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <InfoSection />
    </div>
  );
}

export default SignUpForm;
