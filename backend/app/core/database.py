from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.core.config import settings

db_url = str(settings.DATABASE_URL)

def _create_engine_with_fallback(url: str):
    connect_args = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    try:
        eng = create_engine(url, pool_pre_ping=True, connect_args=connect_args, future=True)
        # test connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception as e:
        print(f"[Database] Could not connect to primary database ({url}): {e}. Falling back to SQLite.")
        fallback_url = "sqlite:///./rajdhani_workforce.db"
        return create_engine(fallback_url, pool_pre_ping=True, connect_args={"check_same_thread": False}, future=True)

engine = _create_engine_with_fallback(db_url)
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