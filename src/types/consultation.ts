export interface MedicalRecord {
  id: number;
  appointmentId: number;
  doctorId: number;
  doctorName?: string;
  patientId: number;
  patientName?: string;
  diagnosis: string;
  symptoms: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionItem {
  id?: number;
  prescriptionId?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

export interface Prescription {
  id: number;
  medicalRecordId: number;
  note: string;
  createdAt?: string;
  items: PrescriptionItem[];
}

export interface CreateMedicalRecordRequest {
  appointmentId: number;
  diagnosis: string;
  symptoms: string;
  notes: string;
}

export interface UpdateMedicalRecordRequest {
  diagnosis: string;
  symptoms: string;
  notes: string;
}

export interface CreatePrescriptionRequest {
  medicalRecordId: number;
  note: string;
  items: PrescriptionItem[];
}
