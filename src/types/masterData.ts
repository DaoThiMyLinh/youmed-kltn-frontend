export interface SpecialtyInfo {
  id: number;
  name: string;
  description?: string;
}

export interface Symptom {
  id: number;
  name: string;
  description?: string;
  specialtyId?: number;
  specialtyName?: string;
  specialty?: SpecialtyInfo;
}

export interface Diagnosis {
  id: number;
  name: string;
  description?: string;
  specialtyId?: number;
  specialtyName?: string;
  specialty?: SpecialtyInfo;
}

export interface MedicineCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Medicine {
  id: number;
  name: string;
  description?: string;
  unit?: string;
  category?: MedicineCategory;
}
