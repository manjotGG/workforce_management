PostgreSQL + SQLAlchemy initialization

Setup:

1. Create a `.env` in `backend/` with:

DATABASE_URL=postgresql+psycopg2://USERNAME:PASSWORD@localhost:5432/rajdhani_workforce

2. Install requirements (in your virtualenv):

pip install -r requirements.txt

Run:

cd backend
uvicorn app.main:app --reload

Notes:
- The app will call `init_db()` on startup which runs `Base.metadata.create_all()` to create missing tables.
- Alembic and migration tooling has been removed; schema is managed by SQLAlchemy models.
