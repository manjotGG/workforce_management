import React from 'react';
import { AttendanceStatus, CalculationStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus | CalculationStatus | string | boolean;
  type?: 'attendance' | 'salary' | 'active';
}


export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'attendance' }) => {
  const getBadgeStyle = () => {
    if (type === 'active') {
      return status
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }

    switch (status) {
      // Attendance Statuses
      case 'PRESENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ABSENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HALF_DAY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PAID_LEAVE':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'UNPAID_LEAVE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HOLIDAY':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'WEEKLY_OFF':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';

      // Calculation Statuses
      case 'DRAFT':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'CALCULATED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PAID':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';

      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formattedText = String(status).replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {formattedText}
    </span>
  );
};
