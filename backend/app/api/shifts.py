from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Shift
from app.schemas.shift import ShiftCreate, ShiftOut

router = APIRouter(prefix="/api/shifts", tags=["shifts"])


@router.get("/", response_model=list[ShiftOut])
def list_shifts(db: Session = Depends(get_db)):
    return db.query(Shift).all()


@router.get("/{shift_id}", response_model=ShiftOut)
def get_shift(shift_id: int, db: Session = Depends(get_db)):
    obj = db.get(Shift, shift_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    return obj


@router.post("/", response_model=ShiftOut, status_code=status.HTTP_201_CREATED)
def create_shift(payload: ShiftCreate, db: Session = Depends(get_db)):
    exists = db.query(Shift).filter(Shift.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="name already exists")
    obj = Shift(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{shift_id}", response_model=ShiftOut)
def update_shift(shift_id: int, payload: ShiftCreate, db: Session = Depends(get_db)):
    obj = db.get(Shift, shift_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
