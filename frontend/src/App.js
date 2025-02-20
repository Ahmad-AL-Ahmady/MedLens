import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./Pages/Signup";
import LoginForm from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ConfirmResetCode from "./Pages/ConfirmResetCode";
import NewPassword from "./Pages/NewPassword";
import HomePage from "./Pages/Homepage";
import VerifyEmailInstructions from "./Pages/VerifyEmailInstructions";
import ScanPage from "./Pages/Scan";
import Layout from "./components/Layout";
import Dashbord from "./Pages/Dashbord";
import DoctorPage from "./Pages/Doctor";
import PharmacyPage from "./Pages/Pharmacy";
import PatientPage from "./Pages/Patient";
function App() {
  return (
    <Router>
      <Routes>
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
        <Route path="/" element={<LoginForm />} />
      </Routes>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashbord />} />
          <Route path="/home" element={<Dashbord />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
