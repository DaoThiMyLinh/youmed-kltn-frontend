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
