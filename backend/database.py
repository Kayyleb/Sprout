# File: database.py
# This file creates the connection from the database to the application, same idea as plaid_client.py but for sqlite
# everything that needs the database imports from here so the setup only happens once

from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker , declarative_base

# the database is one file, it sits in the database/ folder in the project root
DB_PATH = Path(__file__).resolve().parent.parent / "database" / "sprout.db"

# engine is the actual connection to the sqlite file
# check_same_thread is turned off because fastapi can handle one request across different threads
engine = create_engine(f"sqlite:///{DB_PATH}" , connect_args={"check_same_thread" : False})

# SessionLocal makes a new session every time it is called, a session is one conversation with the database
SessionLocal = sessionmaker(bind=engine , autoflush=False)

# Base is what every table in models.py inherits from, it is how sqlalchemy knows which classes are tables
Base = declarative_base()

# let each request get its own session:
# the routes ask for this with Depends(get_Database), and it always closes the session after, even if the request failed
def get_Database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# notes:
# sprout.db is in the gitignore since it will hold password hashes and plaid tokens
# the file does not exist until the tables are created for the first time
