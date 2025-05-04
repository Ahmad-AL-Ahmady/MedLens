import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import InfoSection from "../components/InfoSection";
import Bluelogo from "../assets/images/Bluelogo.png"; // Added the missing import
import "../Styles/Login.css";

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else if (response.status === 404) {
          throw new Error("User not found");
        } else {
          const data = await response.json().catch(() => {
            throw new Error("Server error: Unable to process the request");
          });
          throw new Error(data.message || "Login failed");
        }
      }

      const data = await response.json().catch((error) => {
        throw new Error("Server error: Invalid response format");
      });

      console.log("API Response:", data);

      if (!data.data?.user || !data.data.user.userType) {
        throw new Error("User role not found in response");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", data.token);
      storage.setItem("userRole", data.data.user.userType);

      const userRole = data.data.user.userType;
      console.log("User role:", userRole);

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

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back to MedLens!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      let title = "Error";
      let text = error.message || "An unexpected error occurred";

      if (error.message.includes("Invalid email or password")) {
        title = "Invalid Credentials";
        text =
          "The email or password you entered is incorrect. Please try again.";
      } else if (error.message.includes("User not found")) {
        title = "User Not Found";
        text = "No account exists with this email. Please sign up.";
      } else if (error.message.includes("User role not found")) {
        title = "Role Error";
        text = "Unable to determine user role. Please contact support.";
      } else if (error.message.includes("Unknown user role")) {
        title = "Invalid Role";
        text = "The user role is not recognized. Please contact support.";
      } else if (error.message.includes("NetworkError")) {
        title = "Network Error";
        text =
          "Unable to connect to the server. Please check your internet connection.";
      } else if (error.message.includes("Server error")) {
        title = "Server Error";
        text =
          "We couldn't process your request due to a server issue. Please try again later.";
      } else if (error.message.includes("Invalid response format")) {
        title = "Server Error";
        text =
          "Received an invalid response from the server. Please try again later.";
      }

      Swal.fire({
        icon: "error",
        title: title,
        text: text,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });

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
          <div className="mobile-logo-container">
            <div className="home-logo">
              <img
                src={Bluelogo}
                alt="MedLens Logo"
                className="home-logo-img"
              />
              <span className=" home-logo-text-login">MedLens</span>
            </div>
          </div>
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
