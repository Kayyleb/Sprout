from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy import sessionmaker , declerative_base

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "sprout.db"

engine = create_engine(f"sqlite:///{DB_PATH}" , connect_args={"check_same_thread" : False})
SessionLocal = sessionmaker(bind=engine , autoflush=False)
Base = declerative_base()

# let each request get its own session:
def get_Database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()