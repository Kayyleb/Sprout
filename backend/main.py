# File: main.py
# This is the entry point for the backend, it creates the FastAPI app and connects the routers to it
# to run it, from the project root: uvicorn backend.main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import accounts, transactions
from backend.database import engine, Base
from backend import models # has to be imported so the tables in it are known before they get created

# creates sprout.db and any tables that do not exist yet, tables that are already there are left alone
Base.metadata.create_all(bind=engine)

app = FastAPI()

# The phone app does not need this, it only matters when the app is opened in a browser (expo web running on a different port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Expo's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(transactions.router)

# simple check to make sure the server is up
@app.get("/")
def root():
    return {"status": "backend is running"}

# notes:
# every new router file in routes/ needs to be imported and included here or the app will not see its end points
