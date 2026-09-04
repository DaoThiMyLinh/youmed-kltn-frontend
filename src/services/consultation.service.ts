import axiosClient from '../api/axiosClient';
import type { 
  MedicalRecord, 
  CreateMedicalRecordRequest, 
  UpdateMedicalRecordRequest, 
  Prescription, 
  CreatePrescriptionRequest 
} from '../types/consultation';
import type { Appointment, PageResponse } from '../types/patient';

export const consultationService = {
  getDoctorAppointments: async (
    page = 0, 
    size = 10, 
    sortBy = 'appointmentTime', 
    sortDir = 'ASC'
  ): Promise<PageResponse<Appointment>> => {
    const response = await axiosClient.get<PageResponse<Appointment>>('/appointments/doctor/my', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  updateAppointmentStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await axiosClient.put<Appointment>(`/appointments/${id}/status?status=${status}`, {});
    return response.data;
  },

  getMedicalRecordByAppointmentId: async (appointmentId: number): Promise<MedicalRecord | null> => {
    try {
      const response = await axiosClient.get<MedicalRecord>(`/medical-records/appointment/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createMedicalRecord: async (data: CreateMedicalRecordRequest): Promise<MedicalRecord> => {
    const response = await axiosClient.post<MedicalRecord>('/medical-records', data);
    return response.data;
  },

  updateMedicalRecord: async (id: number, data: UpdateMedicalRecordRequest): Promise<MedicalRecord> => {
    const response = await axiosClient.put<MedicalRecord>(`/medical-records/${id}`, data);
    return response.data;
  },

  getPrescriptionByMedicalRecordId: async (medicalRecordId: number): Promise<Prescription | null> => {
    try {
      const response = await axiosClient.get<Prescription>(`/prescriptions/medical-record/${medicalRecordId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createPrescription: async (data: CreatePrescriptionRequest): Promise<Prescription> => {
    const response = await axiosClient.post<Prescription>('/prescriptions', data);
    return response.data;
  },
  
  getMedicalRecordsHistory: async (page = 0, size = 10): Promise<PageResponse<MedicalRecord>> => {
    const response = await axiosClient.get<PageResponse<MedicalRecord>>('/medical-records', {
      params: { page, size, sortBy: 'createdAt', sortDir: 'DESC' }
    });
    return response.data;
  }
};
