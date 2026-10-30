export interface DoctorReview {
  id: number;
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  patientId: number;
  patientName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DoctorRatingSummary {
  doctorId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateDoctorReviewRequest {
  appointmentId: number;
  rating: number;
  comment?: string;
}
