import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the correct API URL with port 4000
      const response = await axios.post(
        "http://localhost:4000/api/users/forgotPassword",
        { email }
      );

      // If successful, navigate to confirm-code page with email
      console.log("Password reset requested successfully:", response.data);
      navigate("/confirm-code", { state: { email } });
    } catch (err) {
      console.error("Error requesting password reset:", err);
      setError(
        err.response?.data?.message ||
          "Failed to request password reset. Please try again."
      );
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
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Code"}
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
