import axiosClient from '../api/axiosClient';
import type { Doctor } from '../types/appointment';
import type { PageResponse } from '../types/patient';

export interface DoctorCreateRequest {
  fullName: string;
  phone: string;
  email: string;
  specialtyId?: number;
  consultationFee: number;
  biography: string;
}

export interface DoctorUpdateRequest {
  fullName: string;
  phone: string;
  specialtyId?: number;
  consultationFee: number;
  biography: string;
  active?: boolean;
}

export const doctorService = {
  getAllDoctors: async (page: number = 0, size: number = 10, keyword?: string, active?: boolean | string): Promise<PageResponse<Doctor>> => {
    let url = `/doctors?page=${page}&size=${size}`;
    
    if (active !== undefined && active !== 'ALL') {
      url += `&active=${active === 'ACTIVE' || active === true}`;
    }
    
    if (keyword) {
      url = `/doctors/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    }
    
    const response = await axiosClient.get<PageResponse<Doctor>>(url);
    return response.data;
  },

  createDoctor: async (data: DoctorCreateRequest): Promise<Doctor> => {
    const response = await axiosClient.post<Doctor>('/doctors', data);
    return response.data;
  },

  updateDoctor: async (id: number, data: DoctorUpdateRequest): Promise<Doctor> => {
    const response = await axiosClient.put<Doctor>(`/doctors/${id}`, data);
    return response.data;
  },

  deleteDoctor: async (id: number): Promise<void> => {
    await axiosClient.delete(`/doctors/${id}`);
  }
};
