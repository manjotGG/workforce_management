from __future__ import annotations

from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.models.salary import CalculationStatus


class SalaryRecordBase(BaseModel):
    employee_id: int
    salary_year: int
    salary_month: int
    base_monthly_salary: Decimal
    working_days: Optional[int] = 30
    present_days: Optional[int] = 0
    paid_leave_days: Optional[int] = 0
    unpaid_leave_days: Optional[int] = 0
    absent_days: Optional[int] = 0
    holiday_days: Optional[int] = 0
    weekly_off_days: Optional[int] = 0
    deduction_amount: Optional[Decimal] = Decimal("0.00")
    adjustment_amount: Optional[Decimal] = Decimal("0.00")
    final_salary: Optional[Decimal] = Decimal("0.00")
    calculation_status: CalculationStatus = CalculationStatus.DRAFT


class SalaryGenerateRequest(BaseModel):
    salary_year: int
    salary_month: int
    department_id: Optional[int] = None


class SalaryRecordUpdate(BaseModel):
    deduction_amount: Optional[Decimal] = None
    adjustment_amount: Optional[Decimal] = None
    calculation_status: Optional[CalculationStatus] = None


class SalaryRecordOut(SalaryRecordBase):
    id: int
    calculated_at: Optional[datetime] = None
    calculated_by: Optional[int] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
