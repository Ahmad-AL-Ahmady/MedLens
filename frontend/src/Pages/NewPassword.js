import { Link } from "react-router-dom";
import "../Styles/Auth.css";
import Darklogo from "../assets/images/Darklogo.png";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.patch(
        "http://127.0.0.1:4000/api/users/resetPassword",
        {
          password,
          passwordConfirm: confirmPassword,
        },
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error("Reset password error:", err.response?.data);
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

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

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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
