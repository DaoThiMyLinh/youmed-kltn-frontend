import axiosClient from '../api/axiosClient';
import axiosPublic from '../api/axiosPublic';
import type { Specialty } from '../types/specialty';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const getActiveSpecialties = async (): Promise<Specialty[]> => {
  const response = await axiosClient.get<PageResponse<Specialty>>('/specialties?active=true&size=100');
  return response.data.content;
};

// Public version - no auth required, for guest users on Home page
export const getActiveSpecialtiesPublic = async (): Promise<Specialty[]> => {
  const response = await axiosPublic.get<PageResponse<Specialty>>('/specialties?active=true&size=100');
  return response.data.content;
};

export interface SpecialtyRequest {
  name: string;
  description?: string;
  active?: boolean;
  managerId?: number;
}

export const specialtyService = {
  getAllSpecialties: async (page: number = 0, size: number = 10, keyword?: string, active?: boolean | string): Promise<PageResponse<Specialty>> => {
    let url = `/specialties?page=${page}&size=${size}`;
    if (active !== undefined && active !== 'ALL') {
      url += `&active=${active === 'ACTIVE' || active === true}`;
    }
    if (keyword) {
      url = `/specialties/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
    }
    const response = await axiosClient.get<PageResponse<Specialty>>(url);
    return response.data;
  },

  createSpecialty: async (data: SpecialtyRequest): Promise<Specialty> => {
    const response = await axiosClient.post<Specialty>('/specialties', data);
    return response.data;
  },

  updateSpecialty: async (id: number, data: SpecialtyRequest): Promise<Specialty> => {
    const response = await axiosClient.put<Specialty>(`/specialties/${id}`, data);
    return response.data;
  },

  deleteSpecialty: async (id: number): Promise<void> => {
    await axiosClient.delete(`/specialties/${id}`);
  }
};
