from datetime import date, datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models import Attendance, Employee, Shift, AttendanceStatus, AuditLog, UserRole, User
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceOut,
    AttendanceBulkCreate,
)

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("/", response_model=List[AttendanceOut])
def list_attendance(
    attendance_date: Optional[date] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    employee_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    status_filter: Optional[AttendanceStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.ATTENDANCE_OPERATOR)),
):
    query = db.query(Attendance)

    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    if start_date:
        query = query.filter(Attendance.attendance_date >= start_date)
    if end_date:
        query = query.filter(Attendance.attendance_date <= end_date)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if status_filter:
        query = query.filter(Attendance.status == status_filter)

    if department_id:
        query = query.join(Employee).filter(Employee.department_id == department_id)

    records = query.order_by(Attendance.attendance_date.desc(), Attendance.id.desc()).all()

    results = []
    for r in records:
        out = AttendanceOut.model_validate(r)
        if r.employee:
            out.employee_name = r.employee.name
            out.employee_code = r.employee.employee_id
        results.append(out)

    return results


@router.post("/", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def create_or_update_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ATTENDANCE_OPERATOR)),
):
    emp = db.get(Employee, payload.employee_id)
    if not emp:
        raise HTTPException(status_code=400, detail="Employee not found")

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.attendance_date == payload.attendance_date,
        )
        .first()
    )

    if existing:
        existing.status = payload.status
        existing.first_in = payload.first_in
        existing.last_out = payload.last_out
        existing.worked_minutes = payload.worked_minutes
        existing.shift_id = payload.shift_id or emp.shift_id
        existing.remarks = payload.remarks
        db.add(existing)
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        obj = Attendance(
            employee_id=payload.employee_id,
            attendance_date=payload.attendance_date,
            status=payload.status,
            first_in=payload.first_in,
            last_out=payload.last_out,
            worked_minutes=payload.worked_minutes,
            shift_id=payload.shift_id or emp.shift_id,
            remarks=payload.remarks,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        target = obj

    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_ATTENDANCE" if existing else "CREATE_ATTENDANCE",
        entity_type="Attendance",
        entity_id=str(target.id),
        new_values={"employee_id": target.employee_id, "date": str(target.attendance_date), "status": target.status},
    )
    db.add(audit)
    db.commit()

    out = AttendanceOut.model_validate(target)
    out.employee_name = emp.name
    out.employee_code = emp.employee_id
    return out


@router.post("/bulk", status_code=status.HTTP_200_OK)
def bulk_create_attendance(
    payload: AttendanceBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ATTENDANCE_OPERATOR)),
):
    count = 0
    for item in payload.records:
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.employee_id == item.employee_id,
                Attendance.attendance_date == item.attendance_date,
            )
            .first()
        )
        if existing:
            existing.status = item.status
            existing.first_in = item.first_in
            existing.last_out = item.last_out
            existing.remarks = item.remarks
        else:
            emp = db.get(Employee, item.employee_id)
            new_record = Attendance(
                employee_id=item.employee_id,
                attendance_date=item.attendance_date,
                status=item.status,
                first_in=item.first_in,
                last_out=item.last_out,
                shift_id=emp.shift_id if emp else None,
                remarks=item.remarks,
            )
            db.add(new_record)
        count += 1

    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="BULK_UPDATE_ATTENDANCE",
        entity_type="Attendance",
        entity_id=f"bulk_{count}",
        new_values={"updated_count": count},
    )
    db.add(audit)
    db.commit()

    return {"message": f"Successfully updated {count} attendance records", "count": count}


@router.delete("/{attendance_id}", status_code=status.HTTP_200_OK)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ATTENDANCE_OPERATOR)),
):
    obj = db.get(Attendance, attendance_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(obj)
    db.commit()
    return {"status": "deleted"}
