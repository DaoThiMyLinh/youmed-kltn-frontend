import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppointmentState, CreateAppointmentRequest } from '../../../types/appointment';
import { getActiveDoctors, createAppointment, getDoctorTimeSlots } from '../../../services/appointment.service';
import { getActiveSpecialties } from '../../../services/specialty.service';
import type { RootState } from '../../index';

const initialState: AppointmentState = {
  doctors: [],
  specialties: [],
  timeSlots: [],
  loading: false,
  error: null,
  bookingSuccess: false,
};

export const fetchDoctorsThunk = createAsyncThunk(
  'appointment/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const doctors = await getActiveDoctors();
      return doctors;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchSpecialtiesThunk = createAsyncThunk(
  'appointment/fetchSpecialties',
  async (_, { rejectWithValue }) => {
    try {
      const specialties = await getActiveSpecialties();
      return specialties;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch specialties');
    }
  }
);

export const fetchTimeSlotsThunk = createAsyncThunk(
  'appointment/fetchTimeSlots',
  async ({ doctorId, date }: { doctorId: number, date: string }, { rejectWithValue }) => {
    try {
      const slots = await getDoctorTimeSlots(doctorId, date);
      return slots;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch time slots');
    }
  }
);

export const submitAppointmentThunk = createAsyncThunk(
  'appointment/submit',
  async (request: CreateAppointmentRequest, { rejectWithValue }) => {
    try {
      return await createAppointment(request);
    } catch (err: any) {
      // Return specific validation errors if any
      const message = err.response?.data?.message || 'Failed to book appointment';
      return rejectWithValue(message);
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
    resetBookingSuccess: (state) => {
      state.bookingSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctorsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctorsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Specialties
      .addCase(fetchSpecialtiesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialtiesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.specialties = action.payload;
      })
      .addCase(fetchSpecialtiesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch TimeSlots
      .addCase(fetchTimeSlotsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeSlotsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSlots = action.payload;
      })
      .addCase(fetchTimeSlotsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Appointment
      .addCase(submitAppointmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(submitAppointmentThunk.fulfilled, (state) => {
        state.loading = false;
        state.bookingSuccess = true;
      })
      .addCase(submitAppointmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.bookingSuccess = false;
      });
  },
});

export const { clearAppointmentError, resetBookingSuccess } = appointmentSlice.actions;

export const selectDoctors = (state: RootState) => state.appointment.doctors;
export const selectSpecialties = (state: RootState) => state.appointment.specialties;
export const selectAppointmentLoading = (state: RootState) => state.appointment.loading;
export const selectAppointmentError = (state: RootState) => state.appointment.error;
export const selectBookingSuccess = (state: RootState) => state.appointment.bookingSuccess;

export default appointmentSlice.reducer;
