export interface TimeSlot {
  id: number;
  startDateTime: string;
  endDateTime: string;
  booked: boolean;
  doctorScheduleId?: number;
  appointmentId?: number;
}

export interface ScheduleModel {
  id: number;
  doctorId?: number;
  workingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  active: boolean;
  slots?: TimeSlot[];
}

export interface ScheduleRequest {
  workingDate: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CreateScheduleRangeRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface CreateScheduleRangeResponse {
  message: string;
  createdDates: string[];
  skippedDates: string[];
}

export interface DashboardMetrics {
  workingDays: number;
  todaySlots: number;
  bookedSlots: number;
  availableSlots: number;
}
