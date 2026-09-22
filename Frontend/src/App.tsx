import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/Toast';

import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ShiftsPage } from './pages/ShiftsPage';
import { AttendancePage } from './pages/AttendancePage';
import { SalaryPage } from './pages/SalaryPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { LoginPage } from './pages/LoginPage';

import { employeeService } from './services/employeeService';
import { departmentService } from './services/departmentService';
import { shiftService } from './services/shiftService';
import { attendanceService } from './services/attendanceService';
import { salaryService } from './services/salaryService';
import { auditService } from './services/auditService';
import { authService } from './services/authService';

import {
  Employee,
  Department,
  Shift,
  Attendance,
  SalaryRecord,
  AuditLog,
  User,
} from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // State Domain Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Date filters for Attendance and Salary
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [salaryYear, setSalaryYear] = useState<number>(new Date().getFullYear());
  const [salaryMonth, setSalaryMonth] = useState<number>(new Date().getMonth() + 1);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all domain data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empData, deptData, shiftData, attData, salData, auditData] =
        await Promise.allSettled([
          employeeService.getAll(),
          departmentService.getAll(),
          shiftService.getAll(),
          attendanceService.getAll({ attendance_date: attendanceDate }),
          salaryService.getAll({ salary_year: salaryYear, salary_month: salaryMonth }),
          auditService.getAll({ limit: 50 }),
        ]);

      if (empData.status === 'fulfilled') setEmployees(empData.value);
      if (deptData.status === 'fulfilled') setDepartments(deptData.value);
      if (shiftData.status === 'fulfilled') setShifts(shiftData.value);
      if (attData.status === 'fulfilled') setAttendances(attData.value);
      if (salData.status === 'fulfilled') setSalaryRecords(salData.value);
      if (auditData.status === 'fulfilled') setAuditLogs(auditData.value);
    } catch (err: any) {
      console.error('Error loading application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, attendanceDate, salaryYear, salaryMonth]);

  // Auth Handlers
  const handleLogin = async (usr: string, pwd: string) => {
    try {
      const res = await authService.login(usr, pwd);
      setCurrentUser(res.user);
      addToast('success', `Welcome back, ${res.user.username}!`);
    } catch (err: any) {
      addToast('error', err.response?.data?.detail || 'Invalid login credentials');
      throw err;
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    addToast('info', 'Signed out successfully.');
  };

  // Employee Handlers
  const handleAddEmployee = async (data: Partial<Employee>) => {
    const newEmp = await employeeService.create(data);
    addToast('success', `Employee ${newEmp.name} created!`);
    loadData();
  };

  const handleUpdateEmployee = async (id: number, data: Partial<Employee>) => {
    await employeeService.update(id, data);
    addToast('success', 'Employee updated successfully!');
    loadData();
  };

  const handleDeleteEmployee = async (id: number) => {
    await employeeService.delete(id);
    addToast('info', 'Employee deactivated.');
    loadData();
  };

  const handleImportFile = async (file: File) => {
    const res = await employeeService.importFile(file);
    addToast('success', `Imported ${res.successful_rows} employees from file!`);
    loadData();
    return res;
  };

  // Department Handlers
  const handleAddDepartment = async (data: Partial<Department>) => {
    await departmentService.create(data);
    addToast('success', 'Department created!');
    loadData();
  };

  const handleUpdateDepartment = async (id: number, data: Partial<Department>) => {
    await departmentService.update(id, data);
    addToast('success', 'Department updated!');
    loadData();
  };

  const handleDeleteDepartment = async (id: number) => {
    await departmentService.delete(id);
    addToast('info', 'Department removed.');
    loadData();
  };

  // Shift Handlers
  const handleAddShift = async (data: Partial<Shift>) => {
    await shiftService.create(data);
    addToast('success', 'Shift schedule created!');
    loadData();
  };

  const handleUpdateShift = async (id: number, data: Partial<Shift>) => {
    await shiftService.update(id, data);
    addToast('success', 'Shift schedule updated!');
    loadData();
  };

  const handleDeleteShift = async (id: number) => {
    await shiftService.delete(id);
    addToast('info', 'Shift removed.');
    loadData();
  };

  // Attendance Handlers
  const handleSaveAttendance = async (record: Partial<Attendance>) => {
    await attendanceService.createOrUpdate(record);
    addToast('success', 'Attendance record saved.');
    loadData();
  };

  const handleBulkAttendance = async (records: any[]) => {
    await attendanceService.bulkUpdate({ records });
    addToast('success', `Bulk attendance updated for ${records.length} staff!`);
    loadData();
  };

  // Salary Handlers
  const handleGeneratePayroll = async (year: number, month: number, deptId?: number) => {
    const records = await salaryService.generate({ salary_year: year, salary_month: month, department_id: deptId });
    addToast('success', `Generated payroll records for ${records.length} employees!`);
    loadData();
  };

  const handleUpdateSalaryRecord = async (id: number, data: any) => {
    await salaryService.updateRecord(id, data);
    addToast('success', 'Payroll record updated!');
    loadData();
  };

  const handleUpdateSalaryStatus = async (id: number, status: any) => {
    await salaryService.updateStatus(id, status);
    addToast('success', `Payroll status set to ${status}!`);
    loadData();
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const tabTitles: { [key: string]: { title: string; subtitle: string } } = {
    dashboard: { title: 'Executive Overview', subtitle: 'Workforce metrics and daily indicators' },
    employees: { title: 'Employee Management', subtitle: 'Directory, profiles, and CSV batch imports' },
    departments: { title: 'Department Configuration', subtitle: 'Organizational units and headcount allocations' },
    shifts: { title: 'Shifts & Rosters', subtitle: 'Operational hours and shift schedules' },
    attendance: { title: 'Attendance Log', subtitle: 'Daily check-ins, status tracking, and leaves' },
    salary: { title: 'Payroll Engine', subtitle: 'Monthly salary calculation and payslips' },
    audit: { title: 'Audit Trail', subtitle: 'System event log and user activity history' },
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={tabTitles[activeTab]?.title || 'Workforce Portal'}
          subtitle={tabTitles[activeTab]?.subtitle}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        <main className="p-8 flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              employees={employees}
              departments={departments}
              shifts={shifts}
              attendances={attendances}
              salaryRecords={salaryRecords}
              auditLogs={auditLogs}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              departments={departments}
              shifts={shifts}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onImportFile={handleImportFile}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsPage
              departments={departments}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftsPage
              shifts={shifts}
              onAddShift={handleAddShift}
              onUpdateShift={handleUpdateShift}
              onDeleteShift={handleDeleteShift}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage
              attendances={attendances}
              employees={employees}
              departments={departments}
              selectedDate={attendanceDate}
              setSelectedDate={setAttendanceDate}
              onSaveAttendance={handleSaveAttendance}
              onBulkAttendance={handleBulkAttendance}
            />
          )}

          {activeTab === 'salary' && (
            <SalaryPage
              salaryRecords={salaryRecords}
              departments={departments}
              selectedYear={salaryYear}
              setSelectedYear={setSalaryYear}
              selectedMonth={salaryMonth}
              setSelectedMonth={setSalaryMonth}
              onGeneratePayroll={handleGeneratePayroll}
              onUpdateSalaryRecord={handleUpdateSalaryRecord}
              onUpdateSalaryStatus={handleUpdateSalaryStatus}
            />
          )}

          {activeTab === 'audit' && <AuditLogsPage auditLogs={auditLogs} />}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};

export default App;
