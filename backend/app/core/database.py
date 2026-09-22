from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.core.config import settings


engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create missing tables using SQLAlchemy metadata."""
    # Ensure all models are imported so metadata is populated
    Base.metadata.create_all(bind=engine)