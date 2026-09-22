from datetime import date, time, datetime, timedelta
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from app.core.database import SessionLocal, init_db
from app.core.config import settings
from app.models import (
    Department,
    Shift,
    User,
    UserRole,
    Employee,
    Attendance,
    AttendanceStatus,
    SalaryRecord,
    CalculationStatus,
    AuditLog,
)
from passlib.context import CryptContext

import hashlib

def _hash_pwd(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def seed():
    init_db()
    session = SessionLocal()
    try:
        # Check if already seeded
        if session.query(Department).first():
            print("[Seed] Database already contains seed data.")
            return

        print("[Seed] Starting initial database seeding...")

        # 1. Seed Departments
        dept_data = [
            ("Raw Material Purchasing", "Procurement and raw material inventory management"),
            ("Welding / Job Work", "Metal welding, machining, and fabrication unit"),
            ("Assembly Line", "Product assembly and quality integration"),
            ("Quality Testing", "Quality assurance, load testing, and certification"),
            ("Dispatch & Logistics", "Packaging, shipping, and fleet management"),
            ("Administration & HR", "Corporate administration, HR, and accounting"),
        ]
        depts = []
        for name, desc in dept_data:
            d = Department(name=name, description=desc, is_active=True)
            session.add(d)
            depts.append(d)
        session.flush()

        # 2. Seed Shifts
        shift_data = [
            ("General Shift", time(9, 0), time(17, 30), False),
            ("Morning Shift", time(6, 0), time(14, 30), False),
            ("Evening Shift", time(14, 0), time(22, 30), False),
            ("Night Shift", time(22, 0), time(6, 30), True),
        ]
        shifts = []
        for name, start_t, end_t, is_over in shift_data:
            s = Shift(name=name, start_time=start_t, end_time=end_t, is_overnight=is_over, is_active=True)
            session.add(s)
            shifts.append(s)
        session.flush()

        # 3. Seed Users
        hashed_pwd = _hash_pwd(settings.ADMIN_PASSWORD or "admin123")
        admin_user = User(
            username=settings.ADMIN_USERNAME or "admin",
            email=settings.ADMIN_EMAIL or "admin@example.com",
            password_hash=hashed_pwd,
            role=UserRole.ADMIN,
            is_active=True,
        )
        session.add(admin_user)

        manager_user = User(
            username="manager",
            email="manager@example.com",
            password_hash=_hash_pwd("manager123"),
            role=UserRole.MANAGER,
            is_active=True,
        )
        session.add(manager_user)

        session.flush()

        # 4. Seed Employees
        emp_sample = [
            ("EMP-1001", "Rajesh Sharma", "9876543210", depts[0].id, "Purchase Manager", shifts[0].id, Decimal("55000.00"), date(2023, 1, 15)),
            ("EMP-1002", "Amit Kumar", "9876543211", depts[1].id, "Senior Welder", shifts[1].id, Decimal("42000.00"), date(2023, 3, 10)),
            ("EMP-1003", "Priya Singh", "9876543212", depts[2].id, "Assembly Line Lead", shifts[0].id, Decimal("48000.00"), date(2023, 5, 1)),
            ("EMP-1004", "Suresh Verma", "9876543213", depts[3].id, "QA Inspector", shifts[2].id, Decimal("40000.00"), date(2023, 6, 20)),
            ("EMP-1005", "Vikram Patel", "9876543214", depts[4].id, "Dispatch Coordinator", shifts[0].id, Decimal("38000.00"), date(2023, 8, 12)),
            ("EMP-1006", "Sunita Devi", "9876543215", depts[5].id, "HR Specialist", shifts[0].id, Decimal("50000.00"), date(2022, 11, 1)),
            ("EMP-1007", "Deepak Gupta", "9876543216", depts[1].id, "Junior Machinist", shifts[3].id, Decimal("35000.00"), date(2024, 2, 14)),
            ("EMP-1008", "Neha Sharma", "9876543217", depts[2].id, "Assembly Technician", shifts[1].id, Decimal("36000.00"), date(2024, 4, 5)),
        ]
        employees = []
        for code, name, phone, dept_id, desig, shift_id, salary, joining in emp_sample:
            emp = Employee(
                employee_id=code,
                name=name,
                phone=phone,
                department_id=dept_id,
                designation=desig,
                shift_id=shift_id,
                monthly_salary=salary,
                joining_date=joining,
                is_active=True,
            )
            session.add(emp)
            employees.append(emp)
        session.flush()

        # 5. Seed Attendance for past 7 days
        today = date.today()
        statuses = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY, AttendanceStatus.PAID_LEAVE, AttendanceStatus.ABSENT]
        for i in range(7):
            att_date = today - timedelta(days=i)
            for idx, emp in enumerate(employees):
                st = statuses[(idx + i) % len(statuses)]
                first_in = datetime.combine(att_date, time(9, 0)) if st in (AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY) else None
                last_out = datetime.combine(att_date, time(17, 30)) if st == AttendanceStatus.PRESENT else (datetime.combine(att_date, time(13, 0)) if st == AttendanceStatus.HALF_DAY else None)
                worked = 510 if st == AttendanceStatus.PRESENT else (240 if st == AttendanceStatus.HALF_DAY else 0)
                att = Attendance(
                    employee_id=emp.id,
                    attendance_date=att_date,
                    status=st,
                    first_in=first_in,
                    last_out=last_out,
                    worked_minutes=worked,
                    shift_id=emp.shift_id,
                    remarks="Seeded attendance record",
                )
                session.add(att)

        # 6. Seed Salary Record for current month
        curr_year = today.year
        curr_month = today.month
        for emp in employees:
            base = emp.monthly_salary or Decimal("40000.00")
            sal = SalaryRecord(
                employee_id=emp.id,
                salary_year=curr_year,
                salary_month=curr_month,
                base_monthly_salary=base,
                working_days=30,
                present_days=25,
                paid_leave_days=2,
                unpaid_leave_days=1,
                absent_days=2,
                holiday_days=0,
                weekly_off_days=0,
                deduction_amount=Decimal("1000.00"),
                adjustment_amount=Decimal("500.00"),
                final_salary=(base - Decimal("500.00")).quantize(Decimal("0.01")),
                calculation_status=CalculationStatus.CALCULATED,
                calculated_at=datetime.now(),
            )
            session.add(sal)

        # 7. Seed initial Audit Log
        audit = AuditLog(
            user_id=admin_user.id,
            action="INITIAL_SEED",
            entity_type="System",
            entity_id="1",
            new_values={"departments": len(depts), "employees": len(employees)},
        )
        session.add(audit)

        session.commit()
        print("[Seed] Successfully seeded initial workforce data!")
    except IntegrityError as e:
        session.rollback()
        print(f"[Seed] Skipping seed due to integrity constraint: {e}")
    except Exception as e:
        session.rollback()
        print(f"[Seed] Error during seeding: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    seed()
