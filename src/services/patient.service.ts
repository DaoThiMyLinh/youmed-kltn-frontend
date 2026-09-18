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

export const getPatientAppointments = async (
  page?: number,
  size?: number,
  status?: string,
  sortBy?: string,
  sortDir?: string
): Promise<PageResponse<Appointment>> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  if (status) params.append('status', status);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDir) params.append('sortDir', sortDir);

  const queryString = params.toString();
  const url = `/appointments/my${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosClient.get<PageResponse<Appointment>>(url);
  return response.data;
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const response = await axiosClient.put<Appointment>(`/appointments/${id}/cancel`);
  return response.data;
};
