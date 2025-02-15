// ConfirmResetCode.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";

function ConfirmResetCode() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add code verification logic here
    console.log("Verification code:", code);

    // Navigate to new password page
    navigate("/new-password");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src={Darklogo} alt="Company Logo" className="auth-logo" />
          <span className="auth-logo-text">MedLens</span>
        </div>
        <h1 className="auth-title">Verify Your Identity</h1>
        <p className="auth-subtitle">We sent a 6-digit code to {email}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="auth-input"
            maxLength="6"
            required
          />

          <button type="submit" className="auth-button">
            Verify Code
          </button>
        </form>

        <div className="auth-links">
          <Link
            to="/forgot-password"
            className="auth-link"
            state={{ email }} // Preserve email state for resend
          >
            Resend Code
          </Link>
          <Link to="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ConfirmResetCode;
