import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpForm from "./Pages/Signup";
import LoginForm from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import ConfirmResetCode from "./Pages/ConfirmResetCode";
import NewPassword from "./Pages/NewPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm-code" element={<ConfirmResetCode />} />
        <Route path="/new-password" element={<NewPassword />} />

        {/* Add a default route */}
        <Route path="/" element={<LoginForm />} />

        {/* Add other non-auth routes here */}
      </Routes>
    </Router>
  );
}

export default App;
