export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'PAID_LEAVE'
  | 'UNPAID_LEAVE'
  | 'HOLIDAY'
  | 'WEEKLY_OFF';

export type CalculationStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'APPROVED'
  | 'PAID';

export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'ATTENDANCE_OPERATOR';

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  employee_count?: number;
}

export interface Shift {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_overnight: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  employee_count?: number;
}

export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  phone?: string;
  department_id?: number;
  designation?: string;
  shift_id?: number;
  monthly_salary?: number;
  joining_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  department_name?: string;
  shift_name?: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  attendance_date: string;
  first_in?: string;
  last_out?: string;
  status: AttendanceStatus;
  worked_minutes?: number;
  shift_id?: number;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  employee_name?: string;
  employee_code?: string;
}

export interface SalaryRecord {
  id: number;
  employee_id: number;
  salary_year: number;
  salary_month: number;
  base_monthly_salary: number;
  working_days?: number;
  present_days?: number;
  paid_leave_days?: number;
  unpaid_leave_days?: number;
  absent_days?: number;
  holiday_days?: number;
  weekly_off_days?: number;
  deduction_amount?: number;
  adjustment_amount?: number;
  final_salary?: number;
  calculation_status: CalculationStatus;
  calculated_at?: string;
  calculated_by?: number;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at?: string;
  username?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
}

export interface DashboardStats {
  total_employees: number;
  active_departments: number;
  active_shifts: number;
  present_today: number;
  absent_today: number;
  leave_today: number;
  total_payroll_month: number;
  pending_approvals: number;
}
