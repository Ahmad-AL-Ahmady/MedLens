import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { value: "98%", label: "Satisfaction Rate" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "15k+", label: "Reviews" },
  { value: "50+", label: "Countries" },
];

const statsSlice = createSlice({
  name: "overview",
  initialState,
  reducers: {},
});

export default statsSlice.reducer;
