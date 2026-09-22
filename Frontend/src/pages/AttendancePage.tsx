import React, { useState } from 'react';
import { CalendarCheck, Calendar, Filter, Save, CheckCircle, Clock, Search } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Employee, Department, Attendance, AttendanceStatus } from '../types';

interface AttendancePageProps {
  attendances: Attendance[];
  employees: Employee[];
  departments: Department[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onSaveAttendance: (record: Partial<Attendance>) => Promise<void>;
  onBulkAttendance: (records: any[]) => Promise<void>;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({
  attendances,
  employees,
  departments,
  selectedDate,
  setSelectedDate,
  onSaveAttendance,
  onBulkAttendance,
}) => {
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Local draft state for date attendance matrix
  const [localStatuses, setLocalStatuses] = useState<{ [empId: number]: AttendanceStatus }>({});

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = deptFilter === 'ALL' || emp.department_id === Number(deptFilter);
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch && emp.is_active;
  });

  const getAttendanceForEmp = (empId: number) => {
    return attendances.find((a) => a.employee_id === empId && a.attendance_date === selectedDate);
  };

  const handleStatusChange = (empId: number, status: AttendanceStatus) => {
    setLocalStatuses((prev) => ({ ...prev, [empId]: status }));
  };

  const handleQuickSaveRow = async (emp: Employee) => {
    const statusVal = localStatuses[emp.id] || getAttendanceForEmp(emp.id)?.status || 'PRESENT';
    setIsSaving(true);
    try {
      await onSaveAttendance({
        employee_id: emp.id,
        attendance_date: selectedDate,
        status: statusVal,
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkAllPresent = async () => {
    setIsSaving(true);
    try {
      const records = filteredEmployees.map((emp) => ({
        employee_id: emp.id,
        attendance_date: selectedDate,
        status: 'PRESENT' as AttendanceStatus,
      }));
      await onBulkAttendance(records);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed bulk action');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Daily Attendance Manager</h2>
            <p className="text-xs text-slate-400">Record check-ins, check-outs, leaves, and shift attendance</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none"
            />
          </div>

          <button
            onClick={handleMarkAllPresent}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" /> Mark All Present
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department & Shift</th>
                <th className="px-6 py-4">Status Selector</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Save Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEmployees.map((emp) => {
                const existingRec = getAttendanceForEmp(emp.id);
                const currentStatus = localStatuses[emp.id] || existingRec?.status || 'PRESENT';

                return (
                  <tr key={emp.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{emp.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-300">{emp.department_name || 'Unassigned'}</p>
                      <p className="text-xs text-slate-500">{emp.shift_name || 'General Shift'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(emp.id, e.target.value as AttendanceStatus)}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="HALF_DAY">HALF DAY</option>
                        <option value="PAID_LEAVE">PAID LEAVE</option>
                        <option value="UNPAID_LEAVE">UNPAID LEAVE</option>
                        <option value="HOLIDAY">HOLIDAY</option>
                        <option value="WEEKLY_OFF">WEEKLY OFF</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={currentStatus} type="attendance" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleQuickSaveRow(emp)}
                        disabled={isSaving}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-emerald-500"
                        title="Save Attendance"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No active employees found for attendance marking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
