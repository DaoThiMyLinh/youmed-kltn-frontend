import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import patientReducer from './features/patient/patientSlice';
import appointmentReducer from './features/appointment/appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    appointment: appointmentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
