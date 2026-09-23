import { apiClient } from './apiClient';
import { Employee } from '../types';

export interface EmployeeFilterParams {
  department_id?: number;
  shift_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface ImportSummary {
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  failures: any[];
}

export const employeeService = {
  getAll: async (params?: EmployeeFilterParams): Promise<Employee[]> => {
    const res = await apiClient.get<Employee[]>('/employees/', { params });
    return res.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const res = await apiClient.get<Employee>(`/employees/${id}`);
    return res.data;
  },

  create: async (data: Partial<Employee>): Promise<Employee> => {
    const res = await apiClient.post<Employee>('/employees/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const res = await apiClient.put<Employee>(`/employees/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  bulkDelete: async (ids: number[]): Promise<any> => {
    const res = await apiClient.post('/employees/bulk_delete', { employee_ids: ids });
    return res.data;
  },

  importFile: async (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ImportSummary>('/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
