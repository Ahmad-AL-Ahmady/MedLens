import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import InfoSection from "../components/InfoSection";
import "../Styles/Login.css";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Log to inspect the response

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Verify user and userType exist in the response
      if (!data.data?.user || !data.data.user.userType) {
        throw new Error("User role not found in response");
      }

      // Store token and role
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      storage.setItem("userRole", data.data.user.userType);

      // Navigate based on user role
      const userRole = data.data.user.userType;
      console.log("User role:", userRole);

      // Important: Check capitalization of role names as they come from your API
      if (userRole === "Patient") {
        navigate("/patient-dashboard");
      } else if (userRole === "Doctor") {
        navigate("/doctor-dashboard");
      } else if (userRole === "Pharmacy") {
        navigate("/pharmacy-dashboard");
      } else {
        console.error("Unknown role:", userRole);
        throw new Error("Unknown user role: " + userRole);
      }
    } catch (error) {
      setError(error.message || "An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    navigate("/signup-google");
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">
            Access your MedLens healthcare account
          </p>
          <button onClick={handleGoogleLogin} className="google-login">
            <FcGoogle className="google-login-icon" /> Continue with Google
          </button>
          <div className="login-separator">
            <span className="login-separator-span">Or continue with</span>
          </div>
          <form onSubmit={handleSubmit} className="login-form-inputs">
            <label className="login-form-inputs-label">Email Address</label>
            <input
              className="login-form-input"
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="login-form-inputs-label">Password</label>
            <input
              className="login-form-input"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="login-options">
              <div className="login-options-div">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link to="/forgot-password" className="login-form-remeberme">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="login-form-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
          <p className="signup-link-login-form">
            Don't have an account?{" "}
            <Link to="/signup" className="login-form-link-text">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <InfoSection />
    </div>
  );
}

export default LoginForm;
