import csv
import io
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_roles
from app.models import Employee, Department, Shift, UserRole, User

router = APIRouter(prefix="/api/employees", tags=["employees"])


def _parse_date(val: str | None) -> date | None:
    if not val:
        return None
    val = val.strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(val, fmt).date()
        except Exception:
            continue
    try:
        return datetime.fromisoformat(val).date()
    except Exception:
        return None


def _resolve_department(db: Session, val: str | None) -> int | None:
    if not val:
        return None
    val = val.strip()
    if val.isdigit():
        d = db.get(Department, int(val))
        return d.id if d else None
    d = db.query(Department).filter(Department.name.ilike(val)).first()
    return d.id if d else None


def _resolve_shift(db: Session, val: str | None) -> int | None:
    if not val:
        return None
    val = val.strip()
    if val.isdigit():
        s = db.get(Shift, int(val))
        return s.id if s else None
    s = db.query(Shift).filter(Shift.name.ilike(val)).first()
    return s.id if s else None


def _rows_from_csv_bytes(b: bytes):
    text = b.decode(errors="replace")
    f = io.StringIO(text)
    reader = csv.DictReader(f)
    for row in reader:
        yield {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}


def _rows_from_xlsx_fileobj(fileobj):
    try:
        import openpyxl
    except Exception:
        raise RuntimeError("openpyxl is required to parse xlsx files. Install openpyxl.")

    wb = openpyxl.load_workbook(fileobj, read_only=True, data_only=True)
    ws = wb[wb.sheetnames[0]]
    rows = ws.iter_rows(values_only=True)
    try:
        headers = next(rows)
    except StopIteration:
        return
    headers = [h.strip() if isinstance(h, str) else h for h in headers]
    for r in rows:
        d = {}
        for k, v in zip(headers, r):
            if isinstance(k, str):
                d[k.strip()] = v if v is not None else ""
        yield d


@router.post("/import", status_code=status.HTTP_200_OK)
async def import_employees(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.ATTENDANCE_OPERATOR)),
):
    """Import employees from CSV or XLSX. Returns per-row success/failure summary."""
    filename = (file.filename or "").lower()
    if filename.endswith(".csv"):
        data = await file.read()
        rows_iter = _rows_from_csv_bytes(data)
    elif filename.endswith(('.xls', '.xlsx')):
        try:
            contents = await file.read()
            import io as _io
            fh = _io.BytesIO(contents)
            rows_iter = _rows_from_xlsx_fileobj(fh)
        except RuntimeError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload CSV or XLSX.")

    total = 0
    success = 0
    failed = []

    for idx, raw in enumerate(rows_iter, start=1):
        total += 1
        try:
            emp_id = (raw.get('employee_id') or raw.get('id') or '')
            name = raw.get('name') or raw.get('full_name') or ''
            if not emp_id or not str(emp_id).strip():
                raise ValueError('employee_id is required')
            if not name or not str(name).strip():
                raise ValueError('name is required')

            emp_id = str(emp_id).strip()

            exists = db.query(Employee).filter(Employee.employee_id == emp_id).first()
            if exists:
                raise ValueError('employee_id already exists')

            dept_val = raw.get('department') or raw.get('department_id')
            shift_val = raw.get('shift') or raw.get('shift_id')
            dept_id = _resolve_department(db, str(dept_val)) if dept_val else None
            shift_id = _resolve_shift(db, str(shift_val)) if shift_val else None

            monthly_salary = None
            ms_raw = raw.get('monthly_salary') or raw.get('salary') or ''
            if ms_raw not in (None, ""):
                try:
                    monthly_salary = Decimal(str(ms_raw))
                except InvalidOperation:
                    raise ValueError('invalid monthly_salary')

            joining = _parse_date(str(raw.get('joining_date') or raw.get('joining') or ''))

            emp = Employee(
                employee_id=emp_id,
                name=str(name).strip(),
                phone=(raw.get('phone') or None),
                department_id=dept_id,
                designation=(raw.get('designation') or None),
                shift_id=shift_id,
                monthly_salary=monthly_salary,
                joining_date=joining,
                is_active=True,
            )

            db.add(emp)
            db.commit()
            db.refresh(emp)
            success += 1
        except Exception as e:
            db.rollback()
            failed.append({"row": idx, "error": str(e), "data": raw})

    return {"total_rows": total, "successful_rows": success, "failed_rows": len(failed), "failures": failed}
