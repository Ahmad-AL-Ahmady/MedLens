import React, { useState } from "react";
import { Bot, Calendar, MapPin, Stethoscope } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import whiteLogo from "../assets/images/Whitelogo.png";
import "../Styles/Login.css";

function LoginForm() {
  const navigate = useNavigate();

  // ✅ State for form fields and errors
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Make function async
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Store token
      if (rememberMe) {
        localStorage.setItem("authToken", data.token);
      } else {
        sessionStorage.setItem("authToken", data.token);
      }

      // ✅ Redirect user after login
      navigate("/dashboard");
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
          <h1>Login</h1>
          <p>Access your MedAI healthcare account</p>

          <button onClick={handleGoogleLogin} className="google-login">
            <FcGoogle className="icon" /> Continue with Google
          </button>

          <div className="separator">
            <span>Or continue with</span>
          </div>

          {/* ✅ Controlled inputs */}
          <form onSubmit={handleSubmit}>
            <label>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="login-options">
              <div>
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <Link to="/forgot-password" className="link-text">
                Forgot password?
              </Link>
            </div>

            {/* ✅ Disable button when loading */}
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            {/* ✅ Show error message */}
            {error && <p className="error-message">{error}</p>}
          </form>

          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup" className="link-text">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-side-container">
        <div className="auth-side-overlay" />
        <div className="auth-side-content">
          <div className="auth-side-logo">
            <img src={whiteLogo} alt="Logo" />
            <span className="auth-side-logo-text">MedLens</span>
          </div>
          <h2 className="feature-title">Welcome back</h2>
          <div className="feature-list">
            {[
              {
                Icon: Bot,
                title: "AI-Powered Diagnosis",
                desc: "Get AI-driven diagnosis",
              },
              {
                Icon: Calendar,
                title: "Easy Scheduling",
                desc: "Book appointments",
              },
              {
                Icon: MapPin,
                title: "Online Pharmacy",
                desc: "Order medications",
              },
              {
                Icon: Stethoscope,
                title: "Virtual Consultations",
                desc: "Consult doctors online",
              },
            ].map(({ Icon, title, desc }, idx) => (
              <div key={idx} className="feature-item">
                <Icon className="feature-icon" />
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
