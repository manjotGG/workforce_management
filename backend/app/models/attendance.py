from __future__ import annotations

from datetime import datetime, date
from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    String,
    Interval,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class AttendanceStatus(str, PyEnum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    PAID_LEAVE = "PAID_LEAVE"
    UNPAID_LEAVE = "UNPAID_LEAVE"
    HOLIDAY = "HOLIDAY"
    WEEKLY_OFF = "WEEKLY_OFF"


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("employee_id", "attendance_date", name="uq_employee_date"),)

    id: int = Column(Integer, primary_key=True)
    employee_id: int = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date: date = Column(Date, nullable=False, index=True)
    first_in: datetime | None = Column(DateTime(timezone=True), nullable=True)
    last_out: datetime | None = Column(DateTime(timezone=True), nullable=True)
    status: AttendanceStatus = Column(String(50), nullable=False)
    worked_minutes: int | None = Column(Integer, nullable=True)
    shift_id: int | None = Column(Integer, ForeignKey("shifts.id", ondelete="SET NULL"), nullable=True)
    attendance_import_id: int | None = Column(Integer, ForeignKey("attendance_imports.id", ondelete="SET NULL"), nullable=True)
    remarks: str | None = Column(String(1000), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")
    updated_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    employee = relationship("Employee", back_populates="attendances")
