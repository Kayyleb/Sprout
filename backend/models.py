# File: models.py
# This file holds the database tables, each class in here is one table and each Column is one column in that table
# the classes come from the object model doc, only User for right now

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from backend.database import Base

# the current time in UTC, same thing datetime.utcnow() gave (that one is going away in newer python)
# the timezone is taken back off at the end because sqlite saves dates without one
def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

# the users table, one row for every person with a sprout account
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True) # unique id for the user, the database fills this in on its own
    username = Column(String, unique=True, nullable=False) # entered at sign up, no two users can share one
    email = Column(String, unique=True, nullable=False) # used to log in, also has to be unique
    password_hash = Column(String, nullable=False) # the bcrypt hash of the password, the real password is never saved
    email_verified = Column(Boolean, default=False) # turns true once the emailed code is confirmed
    failed_login_count = Column(Integer, default=0) # wrong passwords in a row, log in locks after 5
    locked_until = Column(DateTime, nullable=True) # when log in unlocks again, empty when the account is not locked
    created_date = Column(DateTime, default=utc_now) # date and time the account was created

# notes:
# unique=True is what stops two accounts from using the same email or username, the database rejects the second one
# the next tables (bank connections, accounts, transactions) will go in this file too and link back to user_id
