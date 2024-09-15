import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import geoReducer from "../features/geo/geoSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    geo: geoReducer,
  },
});

export default store;
