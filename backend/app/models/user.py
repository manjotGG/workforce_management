from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
import sqlalchemy as sa
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Enum,
)
from sqlalchemy.orm import relationship

from .base import Base


class UserRole(str, PyEnum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    ATTENDANCE_OPERATOR = "ATTENDANCE_OPERATOR"


class User(Base):
    __tablename__ = "users"

    id: int = Column(Integer, primary_key=True)
    username: str = Column(String(150), nullable=False, unique=True, index=True)
    email: str = Column(String(254), nullable=False, unique=True, index=True)
    password_hash: str = Column(String(255), nullable=False)
    role: UserRole = Column(Enum(UserRole, name="user_role"), nullable=False)
    is_active: bool = Column(Boolean, nullable=False, default=True)
    last_login_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))
    updated_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))

    attendance_imports = relationship("AttendanceImport", back_populates="uploaded_by_user")
