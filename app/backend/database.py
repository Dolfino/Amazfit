import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to SQLite if DATABASE_URL is not set, or contains placeholder text
if not DATABASE_URL or "placeholder" in DATABASE_URL:
    DATABASE_URL = "sqlite:///amazfit.db"

engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, **engine_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Failed to connect to primary DB {DATABASE_URL}: {e}. Falling back to SQLite local db.")
    DATABASE_URL = "sqlite:///amazfit.db"
    engine_args = {"connect_args": {"check_same_thread": False}}
    engine = create_engine(DATABASE_URL, **engine_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
