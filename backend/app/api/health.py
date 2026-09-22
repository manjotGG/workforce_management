from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.core.database import engine

router = APIRouter(tags=["health"]) 


@router.get("/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
    return {"database": "connected", "result": result.scalar()}
