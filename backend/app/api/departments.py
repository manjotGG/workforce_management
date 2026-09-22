from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Department, Employee
from app.schemas.department import DepartmentCreate, DepartmentOut

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("/", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(dept_id: int, db: Session = Depends(get_db)):
    obj = db.get(Department, dept_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    return obj


@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_dept(payload: DepartmentCreate, db: Session = Depends(get_db)):
    exists = db.query(Department).filter(Department.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="name already exists")
    obj = Department(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{dept_id}", response_model=DepartmentOut)
def update_dept(dept_id: int, payload: DepartmentCreate, db: Session = Depends(get_db)):
    obj = db.get(Department, dept_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    # prevent deletion of department referenced by employees (handled by business rule)
    obj.name = payload.name
    obj.description = payload.description
    obj.is_active = payload.is_active
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
