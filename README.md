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
