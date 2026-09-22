from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Employee, Department, Shift
from app.schemas.employee import EmployeeCreate, EmployeeOut, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    # unique employee_id check
    exists = db.query(Employee).filter(Employee.employee_id == payload.employee_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="employee_id already exists")

    # department/shift validation
    if payload.department_id:
        dept = db.get(Department, payload.department_id)
        if not dept:
            raise HTTPException(status_code=400, detail="department_id not found")

    if payload.shift_id:
        sh = db.get(Shift, payload.shift_id)
        if not sh:
            raise HTTPException(status_code=400, detail="shift_id not found")

    obj = Employee(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    items = db.query(Employee).all()
    return items


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    return obj


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="not found")
    obj.is_active = False
    db.add(obj)
    db.commit()
    return {"status": "deactivated"}
