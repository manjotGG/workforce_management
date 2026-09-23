import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Phone,
  Building2,
  Clock,
  BadgeIndianRupee,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { EmployeeAttendanceView } from './EmployeeAttendanceView';
import { Employee, Department, Shift } from '../types';
import { employeeService } from '../services/employeeService';

interface EmployeesPageProps {
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  currentUserRole?: string;
  onAddEmployee: (data: Partial<Employee>) => Promise<void>;
  onUpdateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  onDeleteEmployee: (id: number) => Promise<void>;
  onImportFile: (file: File) => Promise<any>;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  departments,
  shifts,
  currentUserRole,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onImportFile,
}) => {
  const isAdmin = currentUserRole === 'ADMIN';
  const canImport = isAdmin || currentUserRole === 'ATTENDANCE_OPERATOR';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');
  const [shiftFilter, setShiftFilter] = useState<number | 'ALL'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    phone: '',
    department_id: '',
    designation: '',
    shift_id: '',
    monthly_salary: '',
    joining_date: new Date().toISOString().split('T')[0],
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = deptFilter === 'ALL' || emp.department_id === Number(deptFilter);
    const matchesShift = shiftFilter === 'ALL' || emp.shift_id === Number(shiftFilter);

    return matchesSearch && matchesDept && matchesShift;
  });

  const handleOpenAddModal = () => {
    setFormData({
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      phone: '',
      department_id: departments[0]?.id ? String(departments[0].id) : '',
      designation: '',
      shift_id: shifts[0]?.id ? String(shifts[0].id) : '',
      monthly_salary: '45000',
      joining_date: new Date().toISOString().split('T')[0],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      employee_id: emp.employee_id,
      name: emp.name,
      phone: emp.phone || '',
      department_id: emp.department_id ? String(emp.department_id) : '',
      designation: emp.designation || '',
      shift_id: emp.shift_id ? String(emp.shift_id) : '',
      monthly_salary: emp.monthly_salary ? String(emp.monthly_salary) : '',
      joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddEmployee({
        employee_id: formData.employee_id,
        name: formData.name,
        phone: formData.phone || undefined,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        designation: formData.designation || undefined,
        shift_id: formData.shift_id ? Number(formData.shift_id) : undefined,
        monthly_salary: formData.monthly_salary ? Number(formData.monthly_salary) : undefined,
        joining_date: formData.joining_date || undefined,
      });
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;
    setIsSubmitting(true);
    try {
      await onUpdateEmployee(editingEmp.id, {
        name: formData.name,
        phone: formData.phone || undefined,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        designation: formData.designation || undefined,
        shift_id: formData.shift_id ? Number(formData.shift_id) : undefined,
        monthly_salary: formData.monthly_salary ? Number(formData.monthly_salary) : undefined,
        joining_date: formData.joining_date || undefined,
      });
      setEditingEmp(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsSubmitting(true);
    try {
      // prefer provided handler, otherwise call attendanceService.importFile directly
      const res = onImportFile
        ? await onImportFile(selectedFile)
        : await (await import('../services/attendanceService')).attendanceService.importFile(selectedFile);
      setImportResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to import file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Employee Directory</h2>
            <p className="text-xs text-slate-400">Total {employees.length} active and inactive staff</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isAdmin && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              Read-Only Mode ({currentUserRole?.replace('_', ' ')})
            </span>
          )}

          {canImport && (
            <button
              onClick={() => {
                setSelectedFile(null);
                setImportResult(null);
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <Upload className="w-4 h-4 text-brand-400" /> Import CSV / XLSX
            </button>
          )}

            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/20"
              >
                <Plus className="w-4 h-4" /> Add New Employee
              </button>
            )}
            {isAdmin && selectedIds.length > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`Delete ${selectedIds.length} selected employees and ALL their data? This is irreversible.`)) return;
                  try {
                    await employeeService.bulkDelete(selectedIds);
                    // clear selection and refresh
                    setSelectedIds([]);
                    setSelectAll(false);
                    window.location.reload();
                  } catch (err: any) {
                    alert(err.response?.data?.detail || 'Failed to delete selected employees');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
            )}
          {isAdmin && selectedIds.length > 0 && (
            <button
              onClick={async () => {
                if (!confirm(`Delete ${selectedIds.length} selected employees and ALL their data? This is irreversible.`)) return;
                try {
                  await employeeService.bulkDelete(selectedIds);
                  // clear selection and refresh
                  setSelectedIds([]);
                  setSelectAll(false);
                  window.location.reload();
                } catch (err: any) {
                  alert(err.response?.data?.detail || 'Failed to delete selected employees');
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
          )}
        </div>

      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-brand-500 focus:outline-none appearance-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Filter */}
        <div className="relative">
          <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-brand-500 focus:outline-none appearance-none"
          >
            <option value="ALL">All Shifts</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.start_time} - {s.end_time})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department & Role</th>
                <th className="px-6 py-4">Shift Schedule</th>
                <th className="px-6 py-4">Monthly Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds((prev) => (checked ? [...prev, emp.id] : prev.filter((id) => id !== emp.id)));
                        }}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{emp.name}</p>
                        <p className="text-xs text-brand-400 font-mono font-medium">{emp.employee_id}</p>
                        {emp.phone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {emp.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-200">{emp.department_name || 'Unassigned'}</p>
                    <p className="text-xs text-slate-400">{emp.designation || 'Staff Member'}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-medium text-slate-300 border border-slate-800">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {emp.shift_name || 'General Shift'}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                    ₹{emp.monthly_salary ? Number(emp.monthly_salary).toLocaleString('en-IN') : '0'}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={emp.is_active} type="active" />
                  </td>

                  <td className="px-6 py-4 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingEmployeeId(emp.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          title="View Attendance"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
                              await onDeleteEmployee(emp.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Deactivate Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Read Only</span>
                    )}
                  </td>

                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No employees matching the current search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Employee Code</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Shift</label>
              <select
                value={formData.shift_id}
                onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Individual Attendance Modal */}
      <Modal isOpen={!!viewingEmployeeId} onClose={() => setViewingEmployeeId(null)} title="Employee Attendance">
        <div className="p-2">
          <React.Suspense fallback={<div>Loading...</div>}>
            {/* Lazy load to keep bundle small */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <EmployeeAttendanceView employees={employees} employeeId={viewingEmployeeId || undefined} />
          </React.Suspense>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editingEmp} onClose={() => setEditingEmp(null)} title="Edit Employee Details">
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Employee Code</label>
              <input
                type="text"
                disabled
                value={formData.employee_id}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Shift</label>
              <select
                value={formData.shift_id}
                onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select Shift</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.start_time} - {s.end_time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingEmp(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import CSV/XLSX Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Employee Roster">
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50 text-center flex flex-col items-center justify-center">
            <FileSpreadsheet className="w-12 h-12 text-brand-400 mb-3" />
            <p className="text-sm font-semibold text-slate-200">Upload CSV or Excel (.xlsx) file</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Required headers: <code className="text-brand-300">employee_id, name</code>. Optional: <code className="text-brand-300">department, shift, phone, designation, salary</code>.
            </p>

            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="mt-4 text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-500"
            />
          </div>

          {importResult && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <p className="font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Processed {importResult.total_rows} Rows: {importResult.successful_rows} Successful, {importResult.failed_rows} Failed
              </p>

              {importResult.failures && importResult.failures.length > 0 && (
                <div className="text-rose-400 font-mono space-y-1 max-h-32 overflow-y-auto">
                  {importResult.failures.map((f: any, idx: number) => (
                    <p key={idx}>
                      Row #{f.row}: {f.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
