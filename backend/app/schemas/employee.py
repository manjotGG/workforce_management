from __future__ import annotations

from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, condecimal


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., max_length=100)
    name: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    shift_id: Optional[int] = None
    monthly_salary: Optional[condecimal(max_digits=12, decimal_places=2)] = None
    joining_date: Optional[date] = None
    is_active: Optional[bool] = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    department_id: Optional[int]
    designation: Optional[str]
    shift_id: Optional[int]
    monthly_salary: Optional[condecimal(max_digits=12, decimal_places=2)]
    joining_date: Optional[date]
    is_active: Optional[bool]


class EmployeeOut(EmployeeBase):
    id: int

    class Config:
        orm_mode = True
