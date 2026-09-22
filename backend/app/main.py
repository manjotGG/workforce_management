from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine, init_db

app = FastAPI(
    title="Rajdhani Workforce Management System",
    version="0.1.0",
)


@app.on_event("startup")
def on_startup():
    # Initialize DB tables if they are missing
    init_db()


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