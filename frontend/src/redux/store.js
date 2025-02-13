import { configureStore } from "@reduxjs/toolkit";
import featuresReducer from "./featuresSlice";
import heroReducer from "./heroSlice";
import statsReducer from "./statsSlice";
import testimonialsReducer from "./testimonialsSlice";
import howItWorksReducer from "./howItWorksSlice";
import faqReducer from "./faqSlice";
import feedbackReducer from "./feedbackSlice";
import overviewReducer from "./overviewSlice";
import rolesReducer from "./rolesSlice";

export const store = configureStore({
  reducer: {
    hero: heroReducer,
    features: featuresReducer,
    stats: statsReducer,
    howItWorks: howItWorksReducer,
    testimonials: testimonialsReducer,
    faq: faqReducer,
    feedback: feedbackReducer,
    overview: overviewReducer,
    roles: rolesReducer,
  },
});
