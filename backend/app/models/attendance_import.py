from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class ImportStatus(str, PyEnum):
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"


class AttendanceImport(Base):
    __tablename__ = "attendance_imports"

    id: int = Column(Integer, primary_key=True)
    original_filename: str = Column(String(500), nullable=False)
    file_type: str | None = Column(String(50), nullable=True)
    file_hash: str | None = Column(String(128), nullable=True, index=True)
    uploaded_by: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    uploaded_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")
    processing_started_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    processing_completed_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    total_rows: int | None = Column(Integer, nullable=True)
    successful_rows: int | None = Column(Integer, nullable=True)
    failed_rows: int | None = Column(Integer, nullable=True)
    duplicate_rows: int | None = Column(Integer, nullable=True)
    status: ImportStatus = Column(Enum(ImportStatus, name="import_status"), nullable=False, server_default=ImportStatus.PROCESSING.value)
    error_summary = Column(JSONB, nullable=True)

    uploaded_by_user = relationship("User", back_populates="attendance_imports")
    raw_records = relationship("RawAttendanceRecord", back_populates="attendance_import")
