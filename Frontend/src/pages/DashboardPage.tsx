import React from 'react';
import {
  Users,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  BadgeIndianRupee,
  TrendingUp,
  UserPlus,
  CalendarCheck,
  Calculator,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Employee, Department, Shift, Attendance, SalaryRecord, AuditLog } from '../types';

interface DashboardPageProps {
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  attendances: Attendance[];
  salaryRecords: SalaryRecord[];
  auditLogs: AuditLog[];
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  employees,
  departments,
  shifts,
  attendances,
  salaryRecords,
  auditLogs,
  onNavigate,
}) => {
  // Calculations
  const activeEmployees = employees.filter((e) => e.is_active).length;
  const activeDepts = departments.filter((d) => d.is_active).length;
  const activeShifts = shifts.filter((s) => s.is_active).length;

  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;
  const leaveCount = attendances.filter(
    (a) => a.status === 'PAID_LEAVE' || a.status === 'UNPAID_LEAVE' || a.status === 'HALF_DAY'
  ).length;

  const totalPayroll = salaryRecords.reduce((acc, r) => acc + (Number(r.final_salary) || 0), 0);
  const pendingApprovals = salaryRecords.filter(
    (r) => r.calculation_status === 'DRAFT' || r.calculation_status === 'CALCULATED'
  ).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 border border-brand-500/20 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Real-time Workforce Insights
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            Rajdhani Operational Dashboard
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Monitor attendance, manage department allocations, generate monthly payroll, and review complete system operations from a single unified interface.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('employees')}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/30"
            >
              <UserPlus className="w-4 h-4" /> Add Employee
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" /> Log Attendance
            </button>
            <button
              onClick={() => onNavigate('salary')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <Calculator className="w-4 h-4 text-amber-400" /> Run Payroll
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Workforce"
          value={activeEmployees}
          subtitle={`${employees.length} Total Registered`}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-600 to-indigo-600"
          badgeText="100% Active Directory"
        />
        <StatCard
          title="Present Today"
          value={presentCount}
          subtitle={`${absentCount} Absent | ${leaveCount} On Leave`}
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
          badgeText={employees.length > 0 ? `${Math.round((presentCount / employees.length) * 100)}% Turnout Rate` : '0%'}
          badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />
        <StatCard
          title="Active Departments"
          value={activeDepts}
          subtitle={`${activeShifts} Active Shifts Configured`}
          icon={Building2}
          gradient="bg-gradient-to-br from-amber-600 to-orange-600"
          badgeText="Operational"
        />
        <StatCard
          title="Monthly Payroll"
          value={`₹${totalPayroll.toLocaleString('en-IN')}`}
          subtitle={`${pendingApprovals} Pending Approvals`}
          icon={BadgeIndianRupee}
          gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
          badgeText={pendingApprovals > 0 ? 'Requires Action' : 'All Clear'}
          badgeColor={pendingApprovals > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
        />
      </div>

      {/* Middle Grid: Attendance & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Summary Panel */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Attendance Status Breakdown</h3>
              <p className="text-xs text-slate-400">Current active attendance distribution</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View Grid <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{presentCount}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Present</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{absentCount}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">Absent</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-100">{leaveCount}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">On Leave / Half Day</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>Overall Attendance Percentage</span>
              <span className="text-emerald-400 font-bold">
                {employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0}%
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${employees.length > 0 ? (presentCount / employees.length) * 100 : 0}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full"
              ></div>
              <div
                style={{ width: `${employees.length > 0 ? (leaveCount / employees.length) * 100 : 0}%` }}
                className="bg-amber-400 h-full"
              ></div>
              <div
                style={{ width: `${employees.length > 0 ? (absentCount / employees.length) * 100 : 0}%` }}
                className="bg-rose-500 h-full"
              ></div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">Departments</h3>
              <button
                onClick={() => onNavigate('departments')}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {departments.slice(0, 5).map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold">
                      {dept.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{dept.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{dept.description || 'Active Department'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
                    {dept.employee_count || 0} Staff
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('departments')}
            className="w-full mt-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700/80 transition-colors text-center"
          >
            View All {departments.length} Departments
          </button>
        </div>
      </div>

      {/* Recent System Audit Feed */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-brand-400" /> Recent System Audit Feed
            </h3>
            <p className="text-xs text-slate-400">Chronological history of system changes and user actions</p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View Full Audit <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xs">
                  {log.username?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {log.action.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-400">
                    Entity: <span className="text-slate-300 font-medium">{log.entity_type} #{log.entity_id}</span> • By{' '}
                    <span className="text-brand-400 font-medium">{log.username || 'System'}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : 'Just now'}
              </span>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-500 font-medium">No audit activities logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
