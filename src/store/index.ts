import { configureStore } from '@reduxjs/toolkit';
import patientsReducer from './slices/patientsSlice';
import patientDetailReducer from './slices/patientDetailSlice';

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    patientDetail: patientDetailReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
