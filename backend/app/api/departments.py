from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import require_roles
from app.models import Department, Employee, AuditLog, UserRole, User
from app.schemas.department import DepartmentCreate, DepartmentOut

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("/", response_model=List[DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANCE_OPERATOR)),
):
    depts = db.query(Department).all()
    results = []
    for d in depts:
        count = db.query(func.count(Employee.id)).filter(Employee.department_id == d.id, Employee.is_active == True).scalar()
        out = DepartmentOut.model_validate(d)
        out.employee_count = count or 0
        results.append(out)
    return results


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANCE_OPERATOR)),
):
    obj = db.get(Department, dept_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")
    count = db.query(func.count(Employee.id)).filter(Employee.department_id == obj.id, Employee.is_active == True).scalar()
    out = DepartmentOut.model_validate(obj)
    out.employee_count = count or 0
    return out


@router.post("/", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_dept(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    exists = db.query(Department).filter(Department.name == payload.name).first()
    if exists:
        raise HTTPException(status_code=400, detail="Department name already exists")
    obj = Department(
        name=payload.name,
        description=payload.description,
        is_active=payload.is_active if payload.is_active is not None else True,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_DEPARTMENT",
        entity_type="Department",
        entity_id=str(obj.id),
        new_values={"name": obj.name},
    )
    db.add(audit)
    db.commit()

    out = DepartmentOut.model_validate(obj)
    out.employee_count = 0
    return out


@router.put("/{dept_id}", response_model=DepartmentOut)
def update_dept(
    dept_id: int,
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    obj = db.get(Department, dept_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")
    old_name = obj.name
    obj.name = payload.name
    obj.description = payload.description
    if payload.is_active is not None:
        obj.is_active = payload.is_active
    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_DEPARTMENT",
        entity_type="Department",
        entity_id=str(obj.id),
        old_values={"name": old_name},
        new_values={"name": obj.name},
    )
    db.add(audit)
    db.commit()

    count = db.query(func.count(Employee.id)).filter(Employee.department_id == obj.id, Employee.is_active == True).scalar()
    out = DepartmentOut.model_validate(obj)
    out.employee_count = count or 0
    return out


@router.delete("/{dept_id}")
def delete_dept(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    obj = db.get(Department, dept_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Department not found")

    active_emp = db.query(Employee).filter(Employee.department_id == dept_id, Employee.is_active == True).first()
    if active_emp:
        raise HTTPException(status_code=400, detail="Cannot delete department with active employees. Reassign employees first.")

    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
