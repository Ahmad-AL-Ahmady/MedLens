import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./Pages/Signup";
import LoginForm from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ConfirmResetCode from "./Pages/ConfirmResetCode";
import NewPassword from "./Pages/NewPassword";
import VerifyEmailInstructions from "./Pages/VerifyEmailInstructions";
import HomePage from "./Pages/Homepage";
import ScanPage from "./Pages/Scan";
import Layout from "./components/Layout";
import DoctorPage from "./Pages/Doctor";
import PharmacyPage from "./Pages/Pharmacy";
import PatientPage from "./Pages/Patient";
import PatientDashbord from "./Pages/PatientDashbord";
import GoogleSignUpForm from "./Pages/Signupgoogel";
import DoctorDashbord from "./Pages/DoctorDashbord";
import PharmacyDashboard from "./Pages/PharmacyDashboard";
import MedicineDetails from "./components/MedecienDetails";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-code" element={<ConfirmResetCode />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route
          path="/verify-email-instructions"
          element={<VerifyEmailInstructions />}
        />
        <Route path="signup-google" element={<GoogleSignUpForm />} />
        {/* Protected Routes Wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="doctor" element={<DoctorPage />} />
          <Route path="patient" element={<PatientPage />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="medicines/:id" element={<MedicineDetails />} />{" "}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
