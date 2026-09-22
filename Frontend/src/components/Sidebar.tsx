import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarCheck,
  BadgeIndianRupee,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const isOperator = currentUser?.role === 'ATTENDANCE_OPERATOR';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: true },
    { id: 'employees', label: 'Employees', icon: Users, allowed: true },
    { id: 'departments', label: 'Departments', icon: Building2, allowed: true },
    { id: 'shifts', label: 'Shifts & Roster', icon: Clock, allowed: true },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, allowed: true },
    { id: 'salary', label: 'Payroll & Salary', icon: BadgeIndianRupee, allowed: !isOperator },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, allowed: !isOperator },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between min-h-screen sticky top-0 z-30 shadow-2xl backdrop-blur-xl">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-xl">
            R
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg tracking-tight leading-tight flex items-center gap-1.5">
              Rajdhani <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Workforce OS v1.0</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Main Management
          </div>
          {menuItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>
      </div>

      {/* Footer / User Info */}
      <div className="p-4 m-3 rounded-2xl bg-slate-850/80 border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-sm shrink-0">
            {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">
              {currentUser?.username || 'Admin User'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 truncate">
              {currentUser?.role?.replace('_', ' ') || 'ADMIN'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
