from __future__ import annotations

from datetime import datetime, time
from sqlalchemy import Column, Integer, String, Time, Boolean, DateTime
from sqlalchemy.orm import relationship

from .base import Base


class Shift(Base):
    __tablename__ = "shifts"

    id: int = Column(Integer, primary_key=True)
    name: str = Column(String(200), nullable=False, unique=True, index=True)
    start_time: time = Column(Time(timezone=False), nullable=False)
    end_time: time = Column(Time(timezone=False), nullable=False)
    is_overnight: bool = Column(Boolean, nullable=False, default=False)
    is_active: bool = Column(Boolean, nullable=False, default=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")
    updated_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    employees = relationship("Employee", back_populates="shift")
