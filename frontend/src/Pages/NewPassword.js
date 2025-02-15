// NewPassword.jsx
import { Link } from "react-router-dom";
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";

function NewPassword() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src={Darklogo} alt="Company Logo" className="auth-logo" />
          <span className="auth-logo-text">MedLens</span>
        </div>
        <h1 className="auth-title">Create New Password</h1>
        <p className="auth-subtitle">
          Your new password must be different from previous passwords
        </p>

        <form className="auth-form">
          <input
            type="password"
            placeholder="New password"
            className="auth-input"
            required
          />

          <input
            type="password"
            placeholder="Confirm new password"
            className="auth-input"
            required
          />

          <div className="password-requirements">
            <span>Password must contain:</span>
            <ul>
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          <button type="submit" className="auth-button">
            Reset Password
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

export default NewPassword;
