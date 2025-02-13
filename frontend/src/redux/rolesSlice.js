import { createSlice } from "@reduxjs/toolkit";

const rolesSlice = createSlice({
  name: "roles",
  initialState: [
    {
      title: "Patient",
      icon: "👤",
      description: "Access AI medical advice and manage your healthcare",
    },
    {
      title: "Doctor",
      icon: "👨‍⚕️",
      description: "Provide care and collaborate with AI tools",
    },
    {
      title: "Pharmacy",
      icon: "💊",
      description: "Manage prescriptions and inventory",
    },
  ],
  reducers: {},
});

export default rolesSlice.reducer;
