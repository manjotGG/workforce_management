from __future__ import annotations

from typing import Optional
from datetime import time
from pydantic import BaseModel


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

    class Config:
        orm_mode = True
