export interface Specialty {
  id: number;
  name: string;
  description: string;
  active: boolean;
  managerId?: number;
  managerName?: string;
}
