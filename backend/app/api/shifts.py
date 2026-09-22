from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import Shift, Employee, AuditLog
from app.schemas.shift import ShiftCreate, ShiftOut

router = APIRouter(prefix="/api/shifts", tags=["shifts"])


@router.get("/", response_model=List[ShiftOut])
def list_shifts(db: Session = Depends(get_db)):
    shifts = db.query(Shift).all()
    results = []
    for s in shifts:
        count = db.query(func.count(Employee.id)).filter(Employee.shift_id == s.id, Employee.is_active == True).scalar()
        out = ShiftOut.model_validate(s)
        out.employee_count = count or 0
        results.append(out)
    return results


@router.get("/{shift_id}", response_model=ShiftOut)
def get_shift(shift_id: int, db: Session = Depends(get_db)):
    obj = db.get(Shift, shift_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shift not found")
    count = db.query(func.count(Employee.id)).filter(Employee.shift_id == obj.id, Employee.is_active == True).scalar()
    out = ShiftOut.model_validate(obj)
    out.employee_count = count or 0
    return out


@router.post("/", response_model=ShiftOut, status_code=status.HTTP_201_CREATED)
def create_shift(payload: ShiftCreate, db: Session = Depends(get_db)):
    exists = db.query(Shift).filter(Shift.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Shift name already exists")
    obj = Shift(
        name=payload.name,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_overnight=payload.is_overnight or False,
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        action="CREATE_SHIFT",
        entity_type="Shift",
        entity_id=str(obj.id),
        new_values={"name": obj.name},
    )
    db.add(audit)
    db.commit()

    out = ShiftOut.model_validate(obj)
    out.employee_count = 0
    return out


@router.put("/{shift_id}", response_model=ShiftOut)
def update_shift(shift_id: int, payload: ShiftCreate, db: Session = Depends(get_db)):
    obj = db.get(Shift, shift_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shift not found")
    obj.name = payload.name
    obj.start_time = payload.start_time
    obj.end_time = payload.end_time
    if payload.is_overnight is not None:
        obj.is_overnight = payload.is_overnight
    if payload.is_active is not None:
        obj.is_active = payload.is_active
    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        action="UPDATE_SHIFT",
        entity_type="Shift",
        entity_id=str(obj.id),
        new_values={"name": obj.name},
    )
    db.add(audit)
    db.commit()

    count = db.query(func.count(Employee.id)).filter(Employee.shift_id == obj.id, Employee.is_active == True).scalar()
    out = ShiftOut.model_validate(obj)
    out.employee_count = count or 0
    return out


@router.delete("/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    obj = db.get(Shift, shift_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
