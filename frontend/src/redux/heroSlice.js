import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  backgroundImage:
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=2000",
  title: "Advanced AI for Modern Healthcare Solutions",
  subtitle:
    "Empowering medical professionals with cutting-edge AI technology for better diagnosis and patient care.",
  buttonText: "Sign Up",
};

const heroSlice = createSlice({
  name: "hero",
  initialState,
  reducers: {},
});

export const selectHero = (state) => state.hero;
export default heroSlice.reducer;
