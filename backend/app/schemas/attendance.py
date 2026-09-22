from __future__ import annotations

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    employee_id: int
    attendance_date: date
    first_in: Optional[datetime] = None
    last_out: Optional[datetime] = None
    status: AttendanceStatus = AttendanceStatus.PRESENT
    worked_minutes: Optional[int] = None
    shift_id: Optional[int] = None
    remarks: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    first_in: Optional[datetime] = None
    last_out: Optional[datetime] = None
    status: Optional[AttendanceStatus] = None
    worked_minutes: Optional[int] = None
    shift_id: Optional[int] = None
    remarks: Optional[str] = None


class AttendanceBulkItem(BaseModel):
    employee_id: int
    attendance_date: date
    status: AttendanceStatus
    first_in: Optional[datetime] = None
    last_out: Optional[datetime] = None
    remarks: Optional[str] = None


class AttendanceBulkCreate(BaseModel):
    records: List[AttendanceBulkItem]


class AttendanceOut(AttendanceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
