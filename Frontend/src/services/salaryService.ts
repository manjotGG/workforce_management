import { apiClient } from './apiClient';
import { SalaryRecord, CalculationStatus } from '../types';

export interface SalaryFilterParams {
  salary_year?: number;
  salary_month?: number;
  employee_id?: number;
  status?: CalculationStatus;
}

export interface GeneratePayrollPayload {
  salary_year: number;
  salary_month: number;
  department_id?: number;
}

export const salaryService = {
  getAll: async (params?: SalaryFilterParams): Promise<SalaryRecord[]> => {
    const res = await apiClient.get<SalaryRecord[]>('/salary/', { params });
    return res.data;
  },

  generate: async (payload: GeneratePayrollPayload): Promise<SalaryRecord[]> => {
    const res = await apiClient.post<SalaryRecord[]>('/salary/generate', payload);
    return res.data;
  },

  updateRecord: async (
    id: number,
    data: { deduction_amount?: number; adjustment_amount?: number; calculation_status?: CalculationStatus }
  ): Promise<SalaryRecord> => {
    const res = await apiClient.put<SalaryRecord>(`/salary/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: number, status: CalculationStatus): Promise<SalaryRecord> => {
    const res = await apiClient.post<SalaryRecord>(`/salary/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },
};
