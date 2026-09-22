from __future__ import annotations

from typing import Optional
from datetime import time, datetime
from pydantic import BaseModel, ConfigDict


class ShiftBase(BaseModel):
    name: str
    start_time: time
    end_time: time
    is_overnight: Optional[bool] = False
    is_active: Optional[bool] = True


class ShiftCreate(ShiftBase):
    pass


class ShiftOut(ShiftBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    employee_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
