import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  facilities: [
    {
      id: 1,
      title: "General Health",
      description: "Routine Check-ups For Your Health.",
      icon: "❤️",
    },
    {
      id: 2,
      title: "Doctor Tools",
      description: "Manage Patients And Get AI Assistance For Diagnostics.",
      icon: "🩺",
    },
    {
      id: 3,
      title: "Clinic Management",
      description:
        "Involves Coordinating Activities To Ensure Efficient Medical Services.",
      icon: "🏥",
    },
    {
      id: 4,
      title: "Pharmacy Location",
      description: "Find The Nearest Pharmacy Easily.",
      icon: "➕",
    },
    {
      id: 5,
      title: "Scan Analysis",
      description: "AI-powered Insights For Medical Scans.",
      icon: "🔬",
    },
    {
      id: 6,
      title: "Appointment",
      description: "Efficienetly Manage Appointments And Patient Records.",
      icon: "📋",
    },
  ],
};

const facilitiesSlice = createSlice({
  name: "facilities",
  initialState,
  reducers: {},
});

export const selectFacilities = (state) => state.facilities.facilities;
export default facilitiesSlice.reducer;
