from __future__ import annotations

from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., max_length=100)
    name: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    shift_id: Optional[int] = None
    monthly_salary: Optional[Decimal] = None
    joining_date: Optional[date] = None
    is_active: Optional[bool] = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    shift_id: Optional[int] = None
    monthly_salary: Optional[Decimal] = None
    joining_date: Optional[date] = None
    is_active: Optional[bool] = None


class EmployeeOut(EmployeeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    department_name: Optional[str] = None
    shift_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
