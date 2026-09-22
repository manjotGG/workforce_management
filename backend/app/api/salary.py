from datetime import datetime, date
from decimal import Decimal
import calendar
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import extract, and_

from app.core.database import get_db
from app.core.security import require_roles
from app.models import SalaryRecord, Employee, Attendance, AttendanceStatus, CalculationStatus, AuditLog, UserRole, User
from app.schemas.salary import (
    SalaryRecordOut,
    SalaryGenerateRequest,
    SalaryRecordUpdate,
)

router = APIRouter(prefix="/api/salary", tags=["salary"])


@router.get("/", response_model=List[SalaryRecordOut])
def list_salary_records(
    year: Optional[int] = Query(None, alias="salary_year"),
    month: Optional[int] = Query(None, alias="salary_month"),
    employee_id: Optional[int] = Query(None),
    status_filter: Optional[CalculationStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    query = db.query(SalaryRecord)
    if year:
        query = query.filter(SalaryRecord.salary_year == year)
    if month:
        query = query.filter(SalaryRecord.salary_month == month)
    if employee_id:
        query = query.filter(SalaryRecord.employee_id == employee_id)
    if status_filter:
        query = query.filter(SalaryRecord.calculation_status == status_filter)

    records = query.order_by(SalaryRecord.salary_year.desc(), SalaryRecord.salary_month.desc(), SalaryRecord.id.desc()).all()

    results = []
    for r in records:
        out = SalaryRecordOut.model_validate(r)
        if r.employee:
            out.employee_name = r.employee.name
            out.employee_code = r.employee.employee_id
            if r.employee.department:
                out.department_name = r.employee.department.name
        results.append(out)

    return results


@router.post("/generate", response_model=List[SalaryRecordOut])
def generate_payroll(
    payload: SalaryGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    year = payload.salary_year
    month = payload.salary_month

    _, total_days_in_month = calendar.monthrange(year, month)

    emp_query = db.query(Employee).filter(Employee.is_active == True)
    if payload.department_id:
        emp_query = emp_query.filter(Employee.department_id == payload.department_id)

    employees = emp_query.all()
    generated_records = []

    for emp in employees:
        base_salary = emp.monthly_salary or Decimal("0.00")

        attendances = (
            db.query(Attendance)
            .filter(
                Attendance.employee_id == emp.id,
                extract("year", Attendance.attendance_date) == year,
                extract("month", Attendance.attendance_date) == month,
            )
            .all()
        )

        present_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.PRESENT)
        half_day_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.HALF_DAY)
        paid_leave_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.PAID_LEAVE)
        unpaid_leave_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.UNPAID_LEAVE)
        absent_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.ABSENT)
        holiday_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.HOLIDAY)
        weekly_off_cnt = sum(1 for a in attendances if a.status == AttendanceStatus.WEEKLY_OFF)

        payable_days = Decimal(str(present_cnt + (half_day_cnt * 0.5) + paid_leave_cnt + holiday_cnt + weekly_off_cnt))

        daily_rate = base_salary / Decimal(str(total_days_in_month)) if total_days_in_month > 0 else Decimal("0.00")
        calculated_final = (daily_rate * payable_days).quantize(Decimal("0.01"))

        existing = (
            db.query(SalaryRecord)
            .filter(
                SalaryRecord.employee_id == emp.id,
                SalaryRecord.salary_year == year,
                SalaryRecord.salary_month == month,
            )
            .first()
        )

        if existing:
            existing.base_monthly_salary = base_salary
            existing.working_days = total_days_in_month
            existing.present_days = present_cnt
            existing.paid_leave_days = paid_leave_cnt
            existing.unpaid_leave_days = unpaid_leave_cnt
            existing.absent_days = absent_cnt
            existing.holiday_days = holiday_cnt
            existing.weekly_off_days = weekly_off_cnt
            existing.final_salary = (calculated_final - (existing.deduction_amount or Decimal("0.00")) + (existing.adjustment_amount or Decimal("0.00"))).quantize(Decimal("0.01"))
            existing.calculation_status = CalculationStatus.CALCULATED
            existing.calculated_at = datetime.now()
            existing.calculated_by = current_user.id
            db.add(existing)
            db.commit()
            db.refresh(existing)
            rec = existing
        else:
            rec = SalaryRecord(
                employee_id=emp.id,
                salary_year=year,
                salary_month=month,
                base_monthly_salary=base_salary,
                working_days=total_days_in_month,
                present_days=present_cnt,
                paid_leave_days=paid_leave_cnt,
                unpaid_leave_days=unpaid_leave_cnt,
                absent_days=absent_cnt,
                holiday_days=holiday_cnt,
                weekly_off_days=weekly_off_cnt,
                deduction_amount=Decimal("0.00"),
                adjustment_amount=Decimal("0.00"),
                final_salary=calculated_final,
                calculation_status=CalculationStatus.CALCULATED,
                calculated_at=datetime.now(),
                calculated_by=current_user.id,
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)

        out = SalaryRecordOut.model_validate(rec)
        out.employee_name = emp.name
        out.employee_code = emp.employee_id
        if emp.department:
            out.department_name = emp.department.name
        generated_records.append(out)

    audit = AuditLog(
        user_id=current_user.id,
        action="GENERATE_PAYROLL",
        entity_type="SalaryRecord",
        entity_id=f"{year}_{month}",
        new_values={"count": len(generated_records), "month": month, "year": year},
    )
    db.add(audit)
    db.commit()

    return generated_records


@router.put("/{salary_id}", response_model=SalaryRecordOut)
def update_salary_record(
    salary_id: int,
    payload: SalaryRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    rec = db.get(SalaryRecord, salary_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Salary record not found")

    if payload.deduction_amount is not None:
        rec.deduction_amount = payload.deduction_amount
    if payload.adjustment_amount is not None:
        rec.adjustment_amount = payload.adjustment_amount
    if payload.calculation_status is not None:
        rec.calculation_status = payload.calculation_status

    total_days = rec.working_days or 30
    payable = (rec.present_days or 0) + (rec.paid_leave_days or 0) + (rec.holiday_days or 0) + (rec.weekly_off_days or 0)
    daily_rate = rec.base_monthly_salary / Decimal(str(total_days)) if total_days > 0 else Decimal("0.00")
    base_earned = daily_rate * Decimal(str(payable))

    rec.final_salary = (base_earned - (rec.deduction_amount or Decimal("0.00")) + (rec.adjustment_amount or Decimal("0.00"))).quantize(Decimal("0.01"))

    db.add(rec)
    db.commit()
    db.refresh(rec)

    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_SALARY_RECORD",
        entity_type="SalaryRecord",
        entity_id=str(rec.id),
        new_values={"final_salary": str(rec.final_salary)},
    )
    db.add(audit)
    db.commit()

    out = SalaryRecordOut.model_validate(rec)
    if rec.employee:
        out.employee_name = rec.employee.name
        out.employee_code = rec.employee.employee_id
        if rec.employee.department:
            out.department_name = rec.employee.department.name
    return out


@router.post("/{salary_id}/status", response_model=SalaryRecordOut)
def change_salary_status(
    salary_id: int,
    status_val: CalculationStatus = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    rec = db.get(SalaryRecord, salary_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Salary record not found")
    rec.calculation_status = status_val
    db.add(rec)
    db.commit()
    db.refresh(rec)

    audit = AuditLog(
        user_id=current_user.id,
        action="CHANGE_SALARY_STATUS",
        entity_type="SalaryRecord",
        entity_id=str(rec.id),
        new_values={"status": status_val},
    )
    db.add(audit)
    db.commit()

    out = SalaryRecordOut.model_validate(rec)
    if rec.employee:
        out.employee_name = rec.employee.name
        out.employee_code = rec.employee.employee_id
        if rec.employee.department:
            out.department_name = rec.employee.department.name
    return out
