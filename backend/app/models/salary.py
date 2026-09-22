from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
import sqlalchemy as sa
from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Numeric,
    DateTime,
    UniqueConstraint,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class CalculationStatus(str, PyEnum):
    DRAFT = "DRAFT"
    CALCULATED = "CALCULATED"
    APPROVED = "APPROVED"
    PAID = "PAID"


class SalaryRecord(Base):
    __tablename__ = "salary_records"
    __table_args__ = (UniqueConstraint("employee_id", "salary_year", "salary_month", name="uq_salary_month"),)

    id: int = Column(Integer, primary_key=True)
    employee_id: int = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    salary_year: int = Column(Integer, nullable=False, index=True)
    salary_month: int = Column(Integer, nullable=False, index=True)
    base_monthly_salary: Numeric = Column(Numeric(12, 2), nullable=False)
    working_days: int | None = Column(Integer, nullable=True)
    present_days: int | None = Column(Integer, nullable=True)
    paid_leave_days: int | None = Column(Integer, nullable=True)
    unpaid_leave_days: int | None = Column(Integer, nullable=True)
    absent_days: int | None = Column(Integer, nullable=True)
    holiday_days: int | None = Column(Integer, nullable=True)
    weekly_off_days: int | None = Column(Integer, nullable=True)
    deduction_amount: Numeric | None = Column(Numeric(12, 2), nullable=True)
    adjustment_amount: Numeric | None = Column(Numeric(12, 2), nullable=True)
    final_salary: Numeric | None = Column(Numeric(12, 2), nullable=True)
    calculation_status: CalculationStatus = Column(String(50), nullable=False)
    calculated_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    calculated_by: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    calculation_snapshot = Column(JSONB, nullable=True)

    employee = relationship("Employee", back_populates="salary_records")
