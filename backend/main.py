from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import accounts, transactions

app = FastAPI()

# Allows React (running on a different port) to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(transactions.router)

@app.get("/")
def root():
    return {"status": "backend is running"}