export interface PatientProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  role: string;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
