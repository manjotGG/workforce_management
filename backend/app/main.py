from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine, init_db
from app.core.config import settings
from app.seed import seed

from app.api import employees as employees_router
from app.api import departments as departments_router
from app.api import shifts as shifts_router
from app.api import attendance as attendance_router
from app.api import salary as salary_router
from app.api import audit_logs as audit_logs_router
from app.api import auth as auth_router
from app.api import health as health_router
from app.api import employee_imports as employee_imports_router

app = FastAPI(
    title="Rajdhani Workforce Management System API",
    description="Backend API for workforce, attendance, salary, and department management",
    version="1.0.0",
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Initialize DB tables if missing
    init_db()
    # Run seed script automatically if database is fresh
    try:
        seed()
    except Exception as e:
        print(f"[Main] Auto-seed warning: {e}")


# Register API Routers
app.include_router(auth_router.router)
app.include_router(employees_router.router)
app.include_router(departments_router.router)
app.include_router(shifts_router.router)
app.include_router(attendance_router.router)
app.include_router(salary_router.router)
app.include_router(audit_logs_router.router)
app.include_router(health_router.router)
app.include_router(employee_imports_router.router)


@app.get("/")
def root():
    return {
        "message": "Rajdhani Workforce Management System API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

    return {
        "database": "connected",
        "result": result.scalar(),
    }