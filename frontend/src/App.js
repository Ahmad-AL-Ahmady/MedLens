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
import PatientDashboard from "./Pages/PatientDashbord";
import GoogleSignUpForm from "./Pages/Signupgoogel";
import DoctorDashboard from "./Pages/DoctorDashbord";
import PharmacyDashboard from "./Pages/PharmacyDashboard";
import MedicineDetails from "./components/MedecienDetails";
import PatientProfile from "./Pages/PatientProfile";
import DoctorProfile from "./Pages/DoctorProfile";
import PharmacyProfile from "./Pages/PharmacyProfile";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AboutUsPage from "./Pages/AboutUsPage";
import ServicesPage from "./Pages/ServicesPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-code" element={<ConfirmResetCode />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/aboutuspage" element={<AboutUsPage />} />
        <Route path="/servicespage" element={<ServicesPage />} />

        <Route
          path="/verify-email-instructions"
          element={<VerifyEmailInstructions />}
        />
        <Route path="/signup-google" element={<GoogleSignUpForm />} />

        {/* Protected Routes Wrapped in Layout */}
        <Route element={<Layout />}>
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute requiredRole="Patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute requiredRole="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy-dashboard"
            element={
              <ProtectedRoute requiredRole="Pharmacy">
                <PharmacyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <AuthenticatedRoute>
                <ScanPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <AuthenticatedRoute>
                <DoctorPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/pharmacy"
            element={
              <AuthenticatedRoute>
                <PharmacyPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/medicines/:id"
            element={
              <AuthenticatedRoute>
                <MedicineDetails />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/profile/patient"
            element={
              <AuthenticatedRoute>
                <PatientProfile />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/profile/doctor"
            element={
              <AuthenticatedRoute>
                <DoctorProfile />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/profile/pharmacy"
            element={
              <AuthenticatedRoute>
                <PharmacyProfile />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/doctors/:id"
            element={
              <AuthenticatedRoute>
                <DoctorProfile />
              </AuthenticatedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
