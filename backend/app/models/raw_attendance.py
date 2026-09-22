from __future__ import annotations

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class RawAttendanceRecord(Base):
    __tablename__ = "raw_attendance_records"

    id: int = Column(Integer, primary_key=True)
    attendance_import_id: int = Column(Integer, ForeignKey("attendance_imports.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id: int | None = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    device_employee_identifier: str | None = Column(String(200), nullable=True)
    punch_timestamp: datetime = Column(DateTime(timezone=True), nullable=False, index=True)
    punch_type: str | None = Column(String(50), nullable=True)
    source: str | None = Column(String(100), nullable=True)
    raw_data = Column(JSONB, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))

    attendance_import = relationship("AttendanceImport", back_populates="raw_records")
    employee = relationship("Employee", back_populates="raw_attendances")


Index(
    "ix_raw_att_unique",
    "attendance_import_id",
    "device_employee_identifier",
    "punch_timestamp",
    unique=False,
)
