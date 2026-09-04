import axiosInstance from '../api/axios';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

export const verifyOtp = async (data: import('../types/auth').VerifyOtpRequest): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/verify-otp', data);
  return response.data;
};

export const forgotPassword = async (data: import('../types/auth').ForgotPasswordRequest): Promise<any> => {
  const response = await axiosInstance.post('/auth/forgot-password', data);
  return response.data;
};

export const resetPassword = async (data: import('../types/auth').ResetPasswordRequest): Promise<any> => {
  const response = await axiosInstance.post('/auth/reset-password', data);
  return response.data;
};
