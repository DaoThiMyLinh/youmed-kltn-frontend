import axiosClient from '../api/axiosClient';
import type { User, Role, PageResponse } from '../types/user';

export interface AdminUpdateUserRequest {
  role: Role;
  enabled: boolean;
}

export const userService = {
  getAllUsers: async (
    page: number = 0,
    size: number = 10,
    keyword?: string,
    role?: string
  ): Promise<PageResponse<User>> => {
    let url = `/users?page=${page}&size=${size}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (role && role !== 'ALL') {
      url += `&role=${role}`;
    }
    const response = await axiosClient.get<PageResponse<User>>(url);
    return response.data;
  },

  getPatients: async (
    page: number = 0,
    size: number = 10,
    keyword?: string
  ): Promise<PageResponse<User>> => {
    let url = `/users/patients?page=${page}&size=${size}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    const response = await axiosClient.get<PageResponse<User>>(url);
    return response.data;
  },

  getPatientById: async (id: number): Promise<User> => {
    const response = await axiosClient.get<User>(`/users/patients/${id}`);
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axiosClient.get<User>(`/users/${id}`);
    return response.data;
  },

  adminUpdateUserStatus: async (id: number, data: AdminUpdateUserRequest): Promise<User> => {
    const response = await axiosClient.put<User>(`/users/${id}/admin`, data);
    return response.data;
  }
};
