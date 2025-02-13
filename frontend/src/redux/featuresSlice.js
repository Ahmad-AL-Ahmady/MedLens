import { createSlice } from "@reduxjs/toolkit";
import {
  Brain,
  Stethoscope,
  Pill,
  Calendar,
  Store,
  Shield,
} from "lucide-react";

const initialState = {
  items: [
    {
      id: 1,
      title: "AI Disease Diagnosis",
      description:
        "Advanced AI algorithms provide accurate disease diagnosis and treatment recommendations based on symptoms and medical history.",
      icon: <Brain className="icon" />,
      color: "",
    },
    {
      id: 2,
      title: "Book Doctor Appointments",
      description:
        "Easily schedule appointments with qualified healthcare professionals in your area.",
      icon: <Stethoscope className="icon" />,
    },
    {
      id: 3,
      title: "Medicine Finder",
      description:
        "Find and located prescribed medications from nearby pharmacies with real-time availability.",
      icon: <Pill className="icon" />,
    },
    {
      id: 4,
      title: "Doctor's Dashboard",
      description:
        "Comprehensive appointment management system for healthcare providers to organize thier practice.",
      icon: <Calendar className="icon" />,
    },
    {
      id: 5,
      title: "Pharmacy Portal",
      description:
        "Digital inventory management system for pharmacies to list and update medicine availability.",
      icon: <Store className="icon" />,
    },
    {
      id: 6,
      title: "Secure & Compliant",
      description:
        "HIPAA-compliant platform ensuring the security and privacy of all medical data and transactions.",
      icon: <Shield className="icon" />,
    },
  ],
};

const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {},
});

export default featuresSlice.reducer;
