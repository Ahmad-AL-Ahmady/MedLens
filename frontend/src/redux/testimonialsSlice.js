import { createSlice } from "@reduxjs/toolkit";
import person1 from "../assets/images/sara.jpg";
import person2 from "../assets/images/michael.jpg";
import person3 from "../assets/images/lisa.jpg";

const initialState = {
  testimonials: [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      feedback:
        "The AI diagnosis assistance has dramatically improved my ability to make accurate diagnoses quickly.",
      image: person1,
    },
    {
      name: "Michael Chen",
      role: "Patient",
      feedback:
        "Booking appointments and getting prescriptions has never been easier. This platform is a game-changer.",
      image: person2,
    },
    {
      name: "Lisa Thompson",
      role: "Pharmacist",
      feedback:
        "The pharmacy management system has streamlined our inventory and improved customer service.",
      image: person3,
    },
  ],
};

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {},
});

export default testimonialsSlice.reducer;
