export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'DEPARTMENT_MANAGER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
