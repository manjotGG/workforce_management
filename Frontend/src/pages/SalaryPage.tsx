import React, { useState } from 'react';
import {
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  Edit2,
  FileText,
  Filter,
  DollarSign,
  Building2,
  Sparkles,
  Printer,
} from 'lucide-react';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { SalaryRecord, CalculationStatus, Department } from '../types';

interface SalaryPageProps {
  salaryRecords: SalaryRecord[];
  departments: Department[];
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  currentUserRole?: string;
  onGeneratePayroll: (year: number, month: number, deptId?: number) => Promise<void>;
  onUpdateSalaryRecord: (id: number, data: any) => Promise<void>;
  onUpdateSalaryStatus: (id: number, status: CalculationStatus) => Promise<void>;
}

export const SalaryPage: React.FC<SalaryPageProps> = ({
  salaryRecords,
  departments,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  currentUserRole,
  onGeneratePayroll,
  onUpdateSalaryRecord,
  onUpdateSalaryStatus,
}) => {
  const isAdmin = currentUserRole === 'ADMIN';
  const [deptFilter, setDeptFilter] = useState<number | 'ALL'>('ALL');

  const [statusFilter, setStatusFilter] = useState<CalculationStatus | 'ALL'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<SalaryRecord | null>(null);
  const [deductionInput, setDeductionInput] = useState('0');
  const [adjustmentInput, setAdjustmentInput] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payslip Modal State
  const [payslipRecord, setPayslipRecord] = useState<SalaryRecord | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredRecords = salaryRecords.filter((rec) => {
    const matchesDept =
      deptFilter === 'ALL' ||
      departments.find((d) => d.name === rec.department_name)?.id === Number(deptFilter);

    const matchesStatus = statusFilter === 'ALL' || rec.calculation_status === statusFilter;

    return matchesDept && matchesStatus;
  });

  const handleRunGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePayroll(
        selectedYear,
        selectedMonth,
        deptFilter !== 'ALL' ? Number(deptFilter) : undefined
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenEdit = (rec: SalaryRecord) => {
    setEditingRecord(rec);
    setDeductionInput(String(rec.deduction_amount || 0));
    setAdjustmentInput(String(rec.adjustment_amount || 0));
  };

  const handleSaveAdjustments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsSubmitting(true);
    try {
      await onUpdateSalaryRecord(editingRecord.id, {
        deduction_amount: Number(deductionInput),
        adjustment_amount: Number(adjustmentInput),
      });
      setEditingRecord(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update salary adjustments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCalculatedPayroll = filteredRecords.reduce(
    (acc, r) => acc + (Number(r.final_salary) || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <BadgeIndianRupee className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Payroll & Salary Manager</h2>
            <p className="text-xs text-slate-400">Automated working days calculation, deductions, and payslip generation</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm font-semibold focus:outline-none"
          >
            {monthNames.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm font-semibold focus:outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {isAdmin ? (
            <button
              onClick={handleRunGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              <Calculator className="w-4 h-4" />
              {isGenerating ? 'Calculating...' : 'Generate Payroll'}
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
              Read-Only Mode ({currentUserRole?.replace('_', ' ')})
            </span>
          )}
        </div>
      </div>


      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Filtered Monthly Payroll</p>
            <h3 className="text-3xl font-extrabold text-purple-400 mt-2">
              ₹{totalCalculatedPayroll.toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Generated Records</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{filteredRecords.length}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Status Breakdown</p>
            <p className="text-xs text-slate-300 mt-2 font-medium">
              {filteredRecords.filter((r) => r.calculation_status === 'APPROVED').length} Approved |{' '}
              {filteredRecords.filter((r) => r.calculation_status === 'PAID').length} Paid
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Days (Pres / Total)</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Deduction / Adjustments</th>
                <th className="px-6 py-4">Net Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-100">{rec.employee_name || 'Staff'}</p>
                    <p className="text-xs text-purple-400 font-mono">{rec.employee_code}</p>
                    <p className="text-[11px] text-slate-400">{rec.department_name}</p>
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-200">
                    <span className="text-emerald-400 font-bold">{rec.present_days || 0}</span> / {rec.working_days || 30} Days
                    {(rec.paid_leave_days || 0) > 0 && (
                      <span className="block text-[11px] text-sky-400">+{rec.paid_leave_days} Paid Leave</span>
                    )}
                  </td>

                  <td className="px-6 py-4 font-mono font-medium text-slate-300">
                    ₹{Number(rec.base_monthly_salary).toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="text-rose-400 block">-₹{Number(rec.deduction_amount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400 block">+₹{Number(rec.adjustment_amount || 0).toLocaleString('en-IN')}</span>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-lg text-purple-300">
                    ₹{Number(rec.final_salary || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={rec.calculation_status} type="salary" />
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && rec.calculation_status === 'CALCULATED' && (
                        <button
                          onClick={() => onUpdateSalaryStatus(rec.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold border border-emerald-500/30"
                        >
                          Approve
                        </button>
                      )}

                      {isAdmin && rec.calculation_status === 'APPROVED' && (
                        <button
                          onClick={() => onUpdateSalaryStatus(rec.id, 'PAID')}
                          className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-semibold border border-purple-500/30"
                        >
                          Mark Paid
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-2 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          title="Edit Deductions & Adjustments"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => setPayslipRecord(rec)}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                        title="View Payslip"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No payroll records generated for {monthNames[selectedMonth - 1]} {selectedYear}. Click "Generate Payroll" above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Deductions Modal */}
      <Modal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title="Adjust Salary Deductions">
        <form onSubmit={handleSaveAdjustments} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Deduction Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              value={deductionInput}
              onChange={(e) => setDeductionInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Bonus / Adjustment (₹)</label>
            <input
              type="number"
              step="0.01"
              value={adjustmentInput}
              onChange={(e) => setAdjustmentInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingRecord(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Payroll'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Preview Modal */}
      <Modal isOpen={!!payslipRecord} onClose={() => setPayslipRecord(null)} title="Employee Salary Slip">
        {payslipRecord && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="font-extrabold text-lg text-white">RAJDHANI WORKFORCE MANAGEMENT</h4>
                  <p className="text-xs text-slate-400">Official Payslip Statement - {monthNames[payslipRecord.salary_month - 1]} {payslipRecord.salary_year}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={payslipRecord.calculation_status} type="salary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Employee Name:</span>
                  <span className="font-bold text-slate-200 text-sm">{payslipRecord.employee_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Employee Code:</span>
                  <span className="font-mono font-bold text-purple-400 text-sm">{payslipRecord.employee_code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department:</span>
                  <span className="font-semibold text-slate-300">{payslipRecord.department_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Working Days:</span>
                  <span className="font-semibold text-slate-300">{payslipRecord.present_days} / {payslipRecord.working_days} Days</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Base Monthly Salary:</span>
                  <span>₹{Number(payslipRecord.base_monthly_salary).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Deductions:</span>
                  <span>-₹{Number(payslipRecord.deduction_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Adjustments / Bonus:</span>
                  <span>+₹{Number(payslipRecord.adjustment_amount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold text-white">
                  <span>Net Payable Amount:</span>
                  <span className="text-purple-400">₹{Number(payslipRecord.final_salary).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl"
              >
                <Printer className="w-4 h-4" /> Print Payslip
              </button>
              <button
                onClick={() => setPayslipRecord(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
