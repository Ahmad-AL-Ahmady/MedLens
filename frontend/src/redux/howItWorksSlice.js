import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  steps: [
    {
      number: 1,
      title: "Input Symptoms",
      description:
        "Enter your symptoms and medical history into our AI-powered system.",
    },
    {
      number: 2,
      title: "Get AI Analysis",
      description:
        "Our advanced AI analyzes your information and provides potential diagnoses.",
    },
    {
      number: 3,
      title: "Connect with Doctors",
      description:
        "Book appointments with specialists based on the AI recommendations.",
    },
  ],
};

const howItWorksSlice = createSlice({
  name: "howItWorks",
  initialState,
  reducers: {},
});

export default howItWorksSlice.reducer;
