import axiosClient from '../api/axiosClient';
import type { PageResponse } from '../types/patient';
import type { DoctorReview, DoctorRatingSummary, CreateDoctorReviewRequest } from '../types/review';

export const reviewService = {
  createReview: async (data: CreateDoctorReviewRequest): Promise<DoctorReview> => {
    const response = await axiosClient.post<DoctorReview>('/reviews', data);
    return response.data;
  },

  getReviewsByDoctorId: async (doctorId: number, page: number = 0, size: number = 10): Promise<PageResponse<DoctorReview>> => {
    const response = await axiosClient.get<PageResponse<DoctorReview>>(`/doctors/${doctorId}/reviews?page=${page}&size=${size}`);
    return response.data;
  },

  getDoctorRatingSummary: async (doctorId: number): Promise<DoctorRatingSummary> => {
    const response = await axiosClient.get<DoctorRatingSummary>(`/doctors/${doctorId}/rating-summary`);
    return response.data;
  },

  getReviewByAppointmentId: async (appointmentId: number): Promise<DoctorReview> => {
    const response = await axiosClient.get<DoctorReview>(`/reviews/appointment/${appointmentId}`);
    return response.data;
  },

  getMyReviews: async (page: number = 0, size: number = 10): Promise<PageResponse<DoctorReview>> => {
    const response = await axiosClient.get<PageResponse<DoctorReview>>(`/reviews/my?page=${page}&size=${size}`);
    return response.data;
  }
};
