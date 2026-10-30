import axiosClient from '../api/axiosClient';
import type { Doctor } from '../types/appointment';
import type { ScheduleModel } from '../types/schedule';
import type { RejectScheduleRequest } from '../types/manager';

export const managerService = {
  getManagerDoctors: async (): Promise<Doctor[]> => {
    const response = await axiosClient.get<Doctor[]>('/department-manager/doctors');
    return response.data;
  },

  getManagerSchedules: async (): Promise<ScheduleModel[]> => {
    const response = await axiosClient.get<ScheduleModel[]>('/department-manager/schedules');
    return response.data;
  },

  approveSchedule: async (scheduleId: number): Promise<ScheduleModel> => {
    const response = await axiosClient.put<ScheduleModel>(`/department-manager/schedules/${scheduleId}/approve`);
    return response.data;
  },

  rejectSchedule: async (scheduleId: number, data: RejectScheduleRequest): Promise<ScheduleModel> => {
    const response = await axiosClient.put<ScheduleModel>(`/department-manager/schedules/${scheduleId}/reject`, data);
    return response.data;
  }
};
