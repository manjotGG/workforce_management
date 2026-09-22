from sqlalchemy.exc import IntegrityError
from app.core.database import SessionLocal, init_db
from app.core.config import settings
from app.models import (
    Department,
    Shift,
    User,
)
from passlib.context import CryptContext


pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed():
    init_db()
    session = SessionLocal()
    try:
        # Seed departments
        departments = [
            "Raw Material Purchasing",
            "Welding / Job Work",
            "Assembly",
            "Testing",
            "Dispatch",
        ]
        for name in departments:
            session.add(Department(name=name, description=f"Department: {name}"))

        # Seed regular shift
        session.add(Shift(name="Regular Shift", start_time="09:00:00", end_time="17:30:00"))

        # Optional admin user (password must be supplied via env)
        if settings.ADMIN_PASSWORD:
            hashed = pwd_ctx.hash(settings.ADMIN_PASSWORD)
            admin = User(username=settings.ADMIN_USERNAME, email=settings.ADMIN_EMAIL, password_hash=hashed, role="ADMIN")
            session.add(admin)

        session.commit()
    except IntegrityError:
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    seed()
