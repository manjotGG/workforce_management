import { apiClient } from './apiClient';
import { AuditLog } from '../types';

export const auditService = {
  getAll: async (params?: { user_id?: number; entity_type?: string; action?: string; limit?: number }): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>('/audit-logs/', { params });
    return res.data;
  },
};
