from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: int = Column(Integer, primary_key=True)
    user_id: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action: str = Column(String(200), nullable=False)
    entity_type: str | None = Column(String(200), nullable=True, index=True)
    entity_id: str | None = Column(String(200), nullable=True, index=True)
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)
    ip_address: str | None = Column(String(100), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), nullable=False, server_default="now()")

    user = relationship("User")
