import { configureStore } from "@reduxjs/toolkit";
import sliderReducer from "./sliderSlice";
import servicesReducer from "./servicesReducer";
import aboutReducer from "./aboutSlice";
import facilitiesReducer from "./facilitiesSlice";
import opinionReducer from "./opinionSlice";

export const store = configureStore({
  reducer: {
    slider: sliderReducer,
    services: servicesReducer,
    about: aboutReducer,
    facilities: facilitiesReducer,
    opinions: opinionReducer,
  },
});

export default store;
