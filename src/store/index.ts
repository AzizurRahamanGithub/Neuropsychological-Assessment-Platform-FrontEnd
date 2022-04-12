import { configureStore } from "@reduxjs/toolkit";

// ✅ reducers (তোমার file path অনুযায়ী ঠিক করো)
import patientsReducer from "./slices/patientsSlice";
import patientDetailReducer from "./slices/patientDetailSlice";

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    patientDetail: patientDetailReducer,
  },
});

// ✅ types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
