import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  diagnosisAccuracy: "99.9%",
  medicalProfessionals: "50,000+",
  patientsHelped: "1M+",
};

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
});

export default statsSlice.reducer;
