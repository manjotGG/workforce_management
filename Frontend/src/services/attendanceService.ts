import { apiClient } from './apiClient';
import { Attendance, AttendanceStatus } from '../types';

export interface AttendanceFilterParams {
  attendance_date?: string;
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  department_id?: number;
  status?: AttendanceStatus;
}

export interface BulkAttendancePayload {
  records: Array<{
    employee_id: number;
    attendance_date: string;
    status: AttendanceStatus;
    first_in?: string;
    last_out?: string;
    remarks?: string;
  }>;
}

export const attendanceService = {
  getAll: async (params?: AttendanceFilterParams): Promise<Attendance[]> => {
    const res = await apiClient.get<Attendance[]>('/attendance/', { params });
    return res.data;
  },

  createOrUpdate: async (data: Partial<Attendance>): Promise<Attendance> => {
    const res = await apiClient.post<Attendance>('/attendance/', data);
    return res.data;
  },

  bulkUpdate: async (payload: BulkAttendancePayload): Promise<{ message: string; count: number }> => {
    const res = await apiClient.post('/attendance/bulk', payload);
    return res.data;
  },

  importFile: async (file: File): Promise<any> => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/attendance/import_file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/attendance/${id}`);
  },
};
