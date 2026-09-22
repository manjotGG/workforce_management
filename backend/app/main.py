from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine, init_db

app = FastAPI(
    title="Rajdhani Workforce Management System",
    version="0.1.0",
)
from app.api import employees as employees_router
from app.api import departments as departments_router
from app.api import shifts as shifts_router
from app.api import health as health_router
from app.api import employee_imports as employee_imports_router


@app.on_event("startup")
def on_startup():
    # Initialize DB tables if they are missing
    init_db()


app.include_router(employees_router.router)
app.include_router(departments_router.router)
app.include_router(shifts_router.router)
app.include_router(health_router.router)
app.include_router(employee_imports_router.router)


@app.get("/")
def root():
    return {
        "message": "Rajdhani Workforce Management System API",
        "status": "running",
    }


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

    return {
        "database": "connected",
        "result": result.scalar(),
    }