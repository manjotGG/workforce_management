import { apiClient } from './apiClient';
import { Shift } from '../types';

export const shiftService = {
  getAll: async (): Promise<Shift[]> => {
    const res = await apiClient.get<Shift[]>('/shifts/');
    return res.data;
  },

  getById: async (id: number): Promise<Shift> => {
    const res = await apiClient.get<Shift>(`/shifts/${id}`);
    return res.data;
  },

  create: async (data: Partial<Shift>): Promise<Shift> => {
    const res = await apiClient.post<Shift>('/shifts/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Shift>): Promise<Shift> => {
    const res = await apiClient.put<Shift>(`/shifts/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/shifts/${id}`);
  },
};
