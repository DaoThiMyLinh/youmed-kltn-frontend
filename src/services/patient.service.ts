import axiosClient from '../api/axiosClient';
import type { PatientProfile, Appointment, UpdateProfileRequest, PageResponse } from '../types/patient';

export const getPatientProfile = async (): Promise<PatientProfile> => {
  const response = await axiosClient.get(`/users/me`);
  return response.data;
};

export const updatePatientProfile = async (data: UpdateProfileRequest): Promise<PatientProfile> => {
  const response = await axiosClient.put(`/users/me`, data);
  return response.data;
};

export const changePassword = async (data: any): Promise<any> => {
  const response = await axiosClient.put(`/users/me/password`, data);
  return response.data;
};

export const getPatientAppointments = async (): Promise<Appointment[]> => {
  const response = await axiosClient.get<PageResponse<Appointment>>('/appointments/my');
  return response.data.content;
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const response = await axiosClient.put<Appointment>(`/appointments/${id}/cancel`);
  return response.data;
};
