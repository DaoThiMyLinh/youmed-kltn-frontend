import axiosClient from '../api/axiosClient';
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
