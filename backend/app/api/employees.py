from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import require_roles, get_current_user
from app.models import Employee, Department, Shift, AuditLog, UserRole, User
from app.schemas.employee import EmployeeCreate, EmployeeOut, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["employees"])


def _enrich_employee(emp: Employee) -> EmployeeOut:
    out = EmployeeOut.model_validate(emp)
    if emp.department:
        out.department_name = emp.department.name
    if emp.shift:
        out.shift_name = emp.shift.name
    return out


@router.get("/", response_model=List[EmployeeOut])
def list_employees(
    department_id: Optional[int] = Query(None),
    shift_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANCE_OPERATOR)),
):
    query = db.query(Employee)

    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if shift_id:
        query = query.filter(Employee.shift_id == shift_id)
    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Employee.name.ilike(term),
                Employee.employee_id.ilike(term),
                Employee.designation.ilike(term),
                Employee.phone.ilike(term),
            )
        )

    employees = query.order_by(Employee.id.desc()).all()
    return [_enrich_employee(e) for e in employees]


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANCE_OPERATOR)),
):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Employee not found")
    return _enrich_employee(obj)


@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    exists = db.query(Employee).filter(Employee.employee_id == payload.employee_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    if payload.department_id:
        dept = db.get(Department, payload.department_id)
        if not dept:
            raise HTTPException(status_code=400, detail="Department ID not found")

    if payload.shift_id:
        sh = db.get(Shift, payload.shift_id)
        if not sh:
            raise HTTPException(status_code=400, detail="Shift ID not found")

    obj = Employee(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_EMPLOYEE",
        entity_type="Employee",
        entity_id=str(obj.id),
        new_values={"name": obj.name, "employee_id": obj.employee_id},
    )
    db.add(audit)
    db.commit()

    return _enrich_employee(obj)


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "department_id" in update_data and update_data["department_id"] is not None:
        dept = db.get(Department, update_data["department_id"])
        if not dept:
            raise HTTPException(status_code=400, detail="Department ID not found")

    if "shift_id" in update_data and update_data["shift_id"] is not None:
        sh = db.get(Shift, update_data["shift_id"])
        if not sh:
            raise HTTPException(status_code=400, detail="Shift ID not found")

    for k, v in update_data.items():
        setattr(obj, k, v)

    db.add(obj)
    db.commit()
    db.refresh(obj)

    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_EMPLOYEE",
        entity_type="Employee",
        entity_id=str(obj.id),
        new_values={"name": obj.name},
    )
    db.add(audit)
    db.commit()

    return _enrich_employee(obj)


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Employee not found")
    obj.is_active = False
    db.add(obj)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="DEACTIVATE_EMPLOYEE",
        entity_type="Employee",
        entity_id=str(obj.id),
        new_values={"is_active": False},
    )
    db.add(audit)
    db.commit()

    return {"status": "deactivated"}
