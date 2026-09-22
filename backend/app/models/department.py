from __future__ import annotations

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from .base import Base


class Department(Base):
    __tablename__ = "departments"

    id: int = Column(Integer, primary_key=True)
    name: str = Column(String(200), nullable=False, unique=True, index=True)
    description: str | None = Column(String(500), nullable=True)
    is_active: bool = Column(Boolean, nullable=False, default=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))
    updated_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default=sa.text("now()"))

    employees = relationship("Employee", back_populates="department")
