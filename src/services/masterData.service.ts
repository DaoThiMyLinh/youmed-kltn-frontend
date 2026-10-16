import axiosClient from '../api/axiosClient';
import type { Symptom, Diagnosis, Medicine, MedicineCategory } from '../types/masterData';

export const masterDataService = {
  getSymptoms: async (specialtyId?: number): Promise<Symptom[]> => {
    const response = await axiosClient.get<Symptom[]>('/master-data/symptoms', {
      params: specialtyId ? { specialtyId } : {}
    });
    return response.data;
  },

  getDiagnoses: async (specialtyId?: number): Promise<Diagnosis[]> => {
    const response = await axiosClient.get<Diagnosis[]>('/master-data/diagnoses', {
      params: specialtyId ? { specialtyId } : {}
    });
    return response.data;
  },

  getMedicines: async (categoryId?: number): Promise<Medicine[]> => {
    const response = await axiosClient.get<Medicine[]>('/master-data/medicines', {
      params: categoryId ? { categoryId } : {}
    });
    return response.data;
  },

  getMedicineCategories: async (): Promise<MedicineCategory[]> => {
    const response = await axiosClient.get<MedicineCategory[]>('/master-data/medicine-categories');
    return response.data;
  }
};
