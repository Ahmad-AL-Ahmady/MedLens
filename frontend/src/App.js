// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScanPage from "./Pages/Scan";
import Layout from "./components/Layout";
import HomePage from "./Pages/Home";
import DoctorPage from "./Pages/Doctor";
import PharmacyPage from "./Pages/Pharmacy";
import PatientPage from "./Pages/Patient";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
