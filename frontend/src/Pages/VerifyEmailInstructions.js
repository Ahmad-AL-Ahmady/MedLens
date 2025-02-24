import { Link, useLocation } from "react-router-dom";
import { CiMail } from "react-icons/ci";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import "../Styles/VerifyEmailInstructions.css";

function VerifyEmailInstructions() {
  const location = useLocation();
  const email = location.state?.email || "your email";

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
