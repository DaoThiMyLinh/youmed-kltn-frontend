import axiosClient from '../api/axiosClient';
import type { ScheduleModel, ScheduleRequest, CreateScheduleRangeRequest, CreateScheduleRangeResponse, TimeSlot, DashboardMetrics } from '../types/schedule';

let cachedDoctorId: number | null = null;
let cachedDoctorIdPromise: Promise<number> | null = null;

export const scheduleService = {
  getDoctorId: async (): Promise<number> => {
    if (cachedDoctorId !== null) return cachedDoctorId;
    if (cachedDoctorIdPromise !== null) return cachedDoctorIdPromise;

    cachedDoctorIdPromise = (async () => {
      try {
        // Fetch current user details
        const meResponse = await axiosClient.get('/users/me');
        const email = meResponse.data.email;

        // Fetch doctors and find by email
        const doctorsResponse = await axiosClient.get('/doctors?size=1000');
        const doctor = doctorsResponse.data.content.find((d: any) => d.email === email);
        
        if (!doctor) {
          throw new Error('Doctor profile not found for this user.');
        }
        
        cachedDoctorId = doctor.id;
        return doctor.id;
      } finally {
        cachedDoctorIdPromise = null;
      }
    })();

    return cachedDoctorIdPromise;
  },

  clearDoctorIdCache: () => {
    cachedDoctorId = null;
    cachedDoctorIdPromise = null;
  },


  getMySchedules: async (): Promise<ScheduleModel[]> => {
    const doctorId = await scheduleService.getDoctorId();
    const response = await axiosClient.get<ScheduleModel[]>(`/doctor-schedules/doctor/${doctorId}`);
    return response.data;
  },

  createSchedule: async (data: ScheduleRequest): Promise<ScheduleModel> => {
    const doctorId = await scheduleService.getDoctorId();
    const payload = { ...data, doctorId };
    const response = await axiosClient.post<ScheduleModel>('/doctor-schedules', payload);
    return response.data;
  },

  createScheduleRange: async (data: CreateScheduleRangeRequest): Promise<CreateScheduleRangeResponse> => {
    const doctorId = await scheduleService.getDoctorId();
    const payload = { ...data, doctorId };
    const response = await axiosClient.post<CreateScheduleRangeResponse>('/doctor-schedules/range', payload);
    return response.data;
  },

  deleteSchedule: async (id: number): Promise<void> => {
    await axiosClient.delete(`/doctor-schedules/${id}`);
  },

  getScheduleSlots: async (doctorId: number, date: string): Promise<TimeSlot[]> => {
    const response = await axiosClient.get<TimeSlot[]>(`/doctors/${doctorId}/slots?date=${date}`);
    return response.data;
  },

  getDoctorMetrics: async (): Promise<DashboardMetrics> => {
    try {
      // Fallback implementation since backend doesn't have metrics API
      const schedules = await scheduleService.getMySchedules();
      const workingDays = schedules.length;
      
      const doctorId = await scheduleService.getDoctorId();
      
      // We format today's date in local time to avoid timezone mismatch
      // E.g., if it's 2026-07-14 in Vietnam, new Date().toLocaleDateString('en-CA') gives '2026-07-14'
      const today = new Date().toLocaleDateString('en-CA'); 

      let todaySlots = 0;
      let bookedSlots = 0;
      let availableSlots = 0;

      // Fetch slots for all scheduled days concurrently
      const slotsPromises = schedules.map(s => scheduleService.getScheduleSlots(doctorId, s.workingDate));
      const allSlotsArrays = await Promise.all(slotsPromises);
      
      allSlotsArrays.forEach((slots, index) => {
        const scheduleDate = schedules[index].workingDate;
        
        if (scheduleDate === today) {
          todaySlots += slots.length;
        }
        
        bookedSlots += slots.filter(s => s.booked).length;
        availableSlots += slots.filter(s => !s.booked).length;
      });
      
      return {
        workingDays,
        todaySlots,
        bookedSlots,
        availableSlots
      };
    } catch (error) {
      return {
        workingDays: 0,
        todaySlots: 0,
        bookedSlots: 0,
        availableSlots: 0
      };
    }
  }
};
