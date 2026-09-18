import axiosClient from '../api/axiosClient';
import axiosPublic from '../api/axiosPublic';
import type { Doctor, CreateAppointmentRequest, TimeSlot } from '../types/appointment';
import type { Appointment, PageResponse } from '../types/patient';

export const getActiveDoctors = async (): Promise<Doctor[]> => {
  // Using size=100 to get all doctors for the frontend to extract specialties
  // Realistically, pagination or a dedicated /specialties API would be better
  const response = await axiosClient.get<PageResponse<Doctor>>('/doctors?active=true&size=100');
  return response.data.content;
};

// Public version - no auth required, for guest users on Home page
export const getActiveDoctorsPublic = async (): Promise<Doctor[]> => {
  const response = await axiosPublic.get<PageResponse<Doctor>>('/doctors?active=true&size=100');
  return response.data.content;
};

export const createAppointment = async (request: CreateAppointmentRequest): Promise<Appointment> => {
  const response = await axiosClient.post<Appointment>('/appointments', request);
  return response.data;
};

export const getDoctorTimeSlots = async (doctorId: number, date: string): Promise<TimeSlot[]> => {
  const response = await axiosClient.get<TimeSlot[]>(`/doctors/${doctorId}/slots?date=${date}`);
  return response.data;
};
