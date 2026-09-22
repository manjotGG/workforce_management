from __future__ import annotations

from datetime import date, datetime
import sqlalchemy as sa
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Numeric,
    Date,
    Boolean,
    DateTime,
)
from sqlalchemy.orm import relationship

from .base import Base


class Employee(Base):
    __tablename__ = "employees"

    id: int = Column(Integer, primary_key=True)
    employee_id: str = Column(String(100), nullable=False, unique=True, index=True)
    name: str = Column(String(255), nullable=False)
    phone: str | None = Column(String(50), nullable=True)
    department_id: int | None = Column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=True, index=True)
    designation: str | None = Column(String(200), nullable=True)
    shift_id: int | None = Column(Integer, ForeignKey("shifts.id", ondelete="SET NULL"), nullable=True)
    monthly_salary: Numeric | None = Column(Numeric(12, 2), nullable=True)
    joining_date: date | None = Column(Date, nullable=True)
    is_active: bool = Column(Boolean, nullable=False, default=True, index=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))
    updated_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))

    department = relationship("Department", back_populates="employees")
    shift = relationship("Shift", back_populates="employees")
    raw_attendances = relationship("RawAttendanceRecord", back_populates="employee")
    attendances = relationship("Attendance", back_populates="employee")
    salary_records = relationship("SalaryRecord", back_populates="employee")
