import { apiClient } from './apiClient';
import { Department } from '../types';

export const departmentService = {
  getAll: async (): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>('/departments/');
    return res.data;
  },

  getById: async (id: number): Promise<Department> => {
    const res = await apiClient.get<Department>(`/departments/${id}`);
    return res.data;
  },

  create: async (data: Partial<Department>): Promise<Department> => {
    const res = await apiClient.post<Department>('/departments/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Department>): Promise<Department> => {
    const res = await apiClient.put<Department>(`/departments/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },
};
