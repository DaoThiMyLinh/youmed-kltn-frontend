import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PatientProfile, Appointment, UpdateProfileRequest } from '../../../types/patient';
import { getPatientProfile, updatePatientProfile, getPatientAppointments, cancelAppointment } from '../../../services/patient.service';
import type { RootState } from '../../index';

interface PatientState {
  profile: PatientProfile | null;
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

const initialState: PatientState = {
  profile: null,
  appointments: [],
  loading: false,
  error: null,
  updateSuccess: false,
};

export const fetchProfileThunk = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await getPatientProfile();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  'patient/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    try {
      return await updatePatientProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchAppointmentsThunk = createAsyncThunk(
  'patient/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      return await getPatientAppointments();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const cancelAppointmentThunk = createAsyncThunk(
  'patient/cancelAppointment',
  async (id: number, { rejectWithValue }) => {
    try {
      return await cancelAppointment(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    clearPatientError: (state) => {
      state.error = null;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.updateSuccess = false;
      })
      // Fetch Appointments
      .addCase(fetchAppointmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel Appointment
      .addCase(cancelAppointmentThunk.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      });
  },
});

export const { clearPatientError, resetUpdateSuccess } = patientSlice.actions;

export const selectPatientProfile = (state: RootState) => state.patient.profile;
export const selectPatientAppointments = (state: RootState) => state.patient.appointments;
export const selectPatientLoading = (state: RootState) => state.patient.loading;
export const selectPatientError = (state: RootState) => state.patient.error;
export const selectPatientUpdateSuccess = (state: RootState) => state.patient.updateSuccess;

export default patientSlice.reducer;
