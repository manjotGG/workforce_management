# Rajdhani Workforce Management System

A complete full-stack workforce and employee management system built with **FastAPI**, **SQLAlchemy**, **PostgreSQL / SQLite**, **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## Features

- **Dashboard**: Real-time workforce metrics, attendance percentage, department distribution, quick action controls, and audit feeds.
- **Employee Directory**: Full CRUD, search, department/shift filters, soft deactivation, and **CSV / XLSX batch import**.
- **Department Management**: Department cards, headcount tracking, description and active status toggles.
- **Shift & Roster**: Shift schedule configurations, start/end time pickers, and overnight shift support.
- **Attendance Logging**: Daily & monthly attendance grid, status matrix (`PRESENT`, `ABSENT`, `HALF_DAY`, `PAID_LEAVE`, `UNPAID_LEAVE`, `HOLIDAY`, `WEEKLY_OFF`), and bulk marking.
- **Payroll Engine**: Automated monthly payroll calculator based on working days and attendance, deduction/adjustment editor, status workflow (`DRAFT` → `CALCULATED` → `APPROVED` → `PAID`), and printable salary slips.
- **System Audit Trail**: Complete security audit history, tracking user actions and entity modifications.
- **Authentication**: Role-based access control with pre-configured demo user accounts (`admin`, `manager`).

---

## Tech Stack

### Backend
- **Python 3.10+** with **FastAPI**
- **SQLAlchemy 2** (PostgreSQL / SQLite fallback)
- **Pydantic v2** data schemas
- **Uvicorn** ASGI server

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** with modern dark theme glassmorphism styling
- **Lucide Icons**
- **Axios** with centralized API client

---

## Quickstart Guide

### Option A: Local Development (Recommended for quick testing)

#### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies if needed
pip install -r requirements.txt

# Start backend server (Auto-seeds database on initial launch)
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

#### 2. Frontend Setup

In a separate terminal:

```bash
cd Frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```

- Application Web UI: `http://localhost:5173`

---

### Option B: Docker Compose Deployment

To run the full stack (PostgreSQL + FastAPI + Vite React) in Docker containers:

```bash
# In the root project directory
docker-compose up --build
```

- Web Portal: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## Default Admin Credentials

- **Admin Account**: `admin` / `admin123`
- **Manager Account**: `manager` / `manager123`

## Recent Changes — TODO Implementation Summary

The repository now includes the features requested in `todo.txt` (attendance import, database persistence, and individual employee attendance view). Summary of what was added and how to test it:

- Login
	- Added a password visibility toggle on the login page.
	- File: Frontend/src/pages/LoginPage.tsx

- Attendance Import (backend)
	- New endpoint: `POST /api/attendance/import_file` — accepts CSV/XLSX, validates rows, writes to PostgreSQL.
	- Stores raw rows in `raw_attendance_records` and processed rows in `attendance` and `attendance_imports`.
	- File: backend/app/api/attendance_imports.py
	- NOTE: Requires `openpyxl` to parse `.xlsx` files. Install in backend venv: `pip install openpyxl`.

- Attendance APIs
	- Added: `GET /api/attendance/employee/{identifier}` to fetch per-employee attendance with `start_date`/`end_date` filters.
	- File: backend/app/api/attendance.py (new handler function)

- Frontend
	- `attendanceService.importFile(file: File)` to upload files to the new import endpoint.
	- Employee attendance view component: Frontend/src/pages/EmployeeAttendanceView.tsx
	- Employees import modal wired to call the attendance import when appropriate: Frontend/src/pages/EmployeesPage.tsx
	- Attendance page updated to allow selecting an employee, date-range quick filters, and view individual attendance: Frontend/src/pages/AttendancePage.tsx

- Database
	- No schema changes were introduced. The implementation uses existing tables:
		- `attendance`
		- `raw_attendance_records`
		- `attendance_imports`

- Permissions
	- Backend enforces roles using existing `require_roles` decorator; only `ADMIN` and `ATTENDANCE_OPERATOR` may upload/process attendance.

Testing checklist
1. Start backend (activate venv and ensure dependencies installed):

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
pip install openpyxl
uvicorn app.main:app --reload --port 8000
```

2. Start frontend:

```bash
cd Frontend
npm install
npm run dev
```

3. Login with demo accounts (`admin` / `admin123`). Verify password show/hide works and login still functions.

4. Attendance import test:
	- In the UI go to Employees → Import CSV / XLSX (or use the attendance import UI where available).
	- Upload a valid attendance file with `employee_id`, `attendance_date`, and optional `first_in`/`last_out` columns.
	- Confirm the API responds with an import summary (total, successful, failed, duplicate rows).
	- Verify rows in PostgreSQL: inspect `attendance_imports`, `raw_attendance_records`, and `attendance` tables.

5. Duplicate import:
	- Re-upload the same file and verify duplicates are not created (duplicate rows counted in the import summary).

6. Invalid rows:
	- Upload a file containing an invalid `employee_id` and verify valid rows import while invalid rows are reported in the failures list.

7. Individual attendance view:
	- Open the `Attendance` tab, select an employee (or open from Employees table), choose a date range (Last 7 / 30 / custom) and verify attendance list.

Notes & caveats
- The backend import accepts common date/time formats but may require ISO or `DD/MM/YYYY` style for ambiguous values.
- If you run into missing `.xlsx` parsing errors, install `openpyxl` in the backend venv.
- The UI triggers the global `loadData()` on import to refresh lists — for large datasets, consider targeted refreshes.

If you'd like, I can now run a frontend typecheck/build or start the backend server to exercise the new endpoints (tell me which one to run). 
