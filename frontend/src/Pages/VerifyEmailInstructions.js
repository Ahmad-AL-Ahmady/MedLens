import { Link, useLocation, useNavigate } from "react-router-dom";
import { CiMail } from "react-icons/ci";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import whiteLogo from "../assets/images/Whitelogo.png";
import "../Styles/VerifyEmailInstructions.css";
import { useState } from "react";
import {
  FaStethoscope,
  FaCalendarAlt,
  FaMedkit,
  FaRobot,
} from "react-icons/fa";
function VerifyEmailInstructions() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async () => {
    try {
      setIsResending(true);
      setError("");
      const response = await fetch(
        "http://127.0.0.1:4000/api/users/resendVerificationEmail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="form-container">
        <div className="form-content">
          <MdOutlineMarkEmailRead className="email-icon" size={64} />
          <h1 className="title">Verify Your Email Address</h1>
          <p className="instructions">
            We've sent a verification link to{" "}
            <span className="email-highlight">{email}</span>. Please check your
            inbox and click the link to activate your account.
          </p>

          {error && <div className="error-message">{error}</div>}
          {resendSuccess && (
            <div className="success-message">
              Verification email resent successfully!
            </div>
          )}

          <div className="spam-note">
            <CiMail className="spam-icon" />
            <p>
              If you don't see the email, please check your spam folder or
              promotions tab. Still having trouble? Contact our support team.
            </p>
          </div>

          <Link to="/login" className="back-to-login">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailInstructions;
