import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title:
    "We are a team of innovators dedicated to enhancing healthcare accessibility and efficiency using AI.",
  mission:
    " Our mission is to empower doctors and patients with AI-driven tools that streamline diagnostic clinic management, and communication.",
  technology:
    "  We leverage cutting-edge AI technologies for scan analysis, doctors' interaction, and pharmacy integration.",
  icon1: "🏔️",
  icon2: "🛰️",
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    updateAbout: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateAbout } = aboutSlice.actions;
export default aboutSlice.reducer;
