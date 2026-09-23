import React, { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { Employee } from '../types';

interface Props {
  employees: Employee[];
  employeeId?: number | null;
  startDate?: string;
  endDate?: string;
}

export const EmployeeAttendanceView: React.FC<Props> = ({ employees, employeeId, startDate: propStart, endDate: propEnd }) => {
  const empId = employeeId;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [startDate, setStartDate] = useState<string>(propStart || (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split('T')[0]; }));
  const [endDate, setEndDate] = useState<string>(propEnd || (() => new Date().toISOString().split('T')[0]));
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empId) return;
    const emp = employees.find((e) => e.id === empId) || null;
    setEmployee(emp);
  }, [empId, employees]);

  const fetchRecords = async () => {
    if (!empId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceService.getAll({ employee_id: empId, start_date: startDate, end_date: endDate });
      setRecords(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStartDate(propStart || startDate);
  }, [propStart]);

  useEffect(() => {
    setEndDate(propEnd || endDate);
  }, [propEnd]);

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId, startDate, endDate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Employee Attendance</h3>
          <p className="text-sm text-slate-400">Individual attendance overview</p>
        </div>
      </div>

      {employee ? (
        <div className="glass-panel p-4 rounded-xl">
          <p className="font-semibold">{employee.name} — <span className="font-mono text-sm">{employee.employee_id}</span></p>
          <p className="text-xs text-slate-400">{employee.department_name || 'Unassigned'} • {employee.designation || 'Staff'}</p>

          <div className="mt-4 flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 bg-slate-900 rounded" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 bg-slate-900 rounded" />
            <button onClick={fetchRecords} className="px-3 py-2 bg-brand-600 rounded text-white">Apply</button>
            <button onClick={() => { const d = new Date(); d.setDate(d.getDate()-6); setStartDate(d.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }} className="px-3 py-2 bg-slate-800 rounded text-slate-200">Last 7 days</button>
            <button onClick={() => { const d = new Date(); d.setDate(d.getDate()-29); setStartDate(d.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }} className="px-3 py-2 bg-slate-800 rounded text-slate-200">Last 30 days</button>
          </div>

          <div className="mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-rose-400">{error}</p>
            ) : records.length === 0 ? (
              <p className="text-slate-400">No attendance records in this range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-400">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">First In</th>
                      <th className="px-4 py-2">Last Out</th>
                      <th className="px-4 py-2">Worked</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-t border-slate-800">
                        <td className="px-4 py-2">{new Date(r.attendance_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{r.first_in ? new Date(r.first_in).toLocaleTimeString() : '--'}</td>
                        <td className="px-4 py-2">{r.last_out ? new Date(r.last_out).toLocaleTimeString() : '--'}</td>
                        <td className="px-4 py-2">{r.worked_minutes ? `${Math.floor(r.worked_minutes/60)}h ${r.worked_minutes%60}m` : '--'}</td>
                        <td className="px-4 py-2">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Weekly summary */}
          {records.length > 0 && (
            <div className="mt-4 p-3 bg-slate-900 rounded">
              <h4 className="font-semibold">Summary</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div><strong>Total Days:</strong> {records.length}</div>
                <div><strong>Present:</strong> {records.filter(r => r.status === 'PRESENT').length}</div>
                <div><strong>Absent:</strong> {records.filter(r => r.status === 'ABSENT').length}</div>
                <div><strong>Total Worked:</strong> {`${Math.floor(records.reduce((s,r)=>s+(r.worked_minutes||0),0)/60)}h ${records.reduce((s,r)=>s+(r.worked_minutes||0),0)%60}m`}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>Select an employee to view attendance.</p>
      )}
    </div>
  );
};
