import type { Specialty } from './specialty';
import type { Role } from './user';

export interface Doctor {
  id: number;
  fullName: string;
  specialty: Specialty | null;
  consultationFee: number;
  phone: string;
  email: string;
  biography: string;
  active: boolean;
  role?: Role;
  createdAt: string;
  averageRating?: number;
  totalReviews?: number;
}

export interface TimeSlot {
  id: number;
  doctorScheduleId: number;
  startDateTime: string;
  endDateTime: string;
  booked: boolean;
  appointmentId: number | null;
}

export interface CreateAppointmentRequest {
  timeSlotId: number;
  reason: string;
}

export interface AppointmentState {
  doctors: Doctor[];
  specialties: Specialty[];
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  bookingSuccess: boolean;
}
