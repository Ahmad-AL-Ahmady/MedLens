// ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Initialize navigate hook

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your password reset request logic here
    console.log("Password reset requested for:", email);

    // Navigate to confirm-code page with email state
    navigate("/confirm-code", { state: { email } });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Add logo section */}
        <div className="auth-logo-container">
          <img src={Darklogo} alt="Company Logo" className="auth-logo" />
          <span className="auth-logo-text">MedLens</span>
        </div>
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />

          <button type="submit" className="auth-button">
            Send Reset Code
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
