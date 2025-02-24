import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";

function ConfirmResetCode() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError(
        "Email information is missing. Please go back to the forgot password page."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Sending request with:", { email, code });
      // Before sending to the backend
      const trimmedCode = code.trim(); // Remove any whitespace, still a string

      // Explicitly ensure it's a string using String() constructor (optional but explicit)
      const stringCode = String(trimmedCode);
      const response = await axios.post(
        "http://localhost:4000/api/users/verifyOTP",
        {
          email,
          otp: stringCode,
        },
        { withCredentials: true } // Add this line
      );

      console.log("OTP verification success:", response.data);

      navigate("/new-password", { state: { email, resetSession: true } });
    } catch (err) {
      console.error("Error verifying code:", err);

      if (err.response) {
        console.error("Backend error response:", err.response.data);
        setError(
          err.response.data.message ||
            "Invalid or expired code. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src={Darklogo} alt="Company Logo" className="auth-logo" />
          <span className="auth-logo-text">MedLens</span>
        </div>
        <h1 className="auth-title">Verify Your Identity</h1>
        <p className="auth-subtitle">
          {email
            ? `We sent a 6-digit code to ${email}`
            : "Please enter your verification code"}
        </p>

        {error && <div className="auth-error">{error}</div>}

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

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link" state={{ email }}>
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
