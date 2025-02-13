import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openFaq: null,
  faqs: [
    {
      question: "How accurate is the AI diagnosis?",
      answer:
        "Our AI system has achieved 99.9% accuracy in initial diagnoses, verified by medical professionals.",
    },
    {
      question: "Is my medical data secure?",
      answer:
        "Yes, we use enterprise-grade encryption and are fully HIPAA compliant to protect your medical information.",
    },
    {
      question: "How do I book an appointment?",
      answer:
        "Simply select a doctor from our network, choose an available time slot, and confirm your booking.",
    },
  ],
};

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    toggleFaq: (state, action) => {
      state.openFaq = state.openFaq === action.payload ? null : action.payload;
    },
  },
});

export const { toggleFaq } = faqSlice.actions;
export default faqSlice.reducer;
