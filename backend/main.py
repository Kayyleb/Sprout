# File: main.py
# This is the entry point for the backend, it creates the FastAPI app and connects the routers to it
# to run it, from the project root: uvicorn backend.main:app --reload

import plaid
from fastapi import FastAPI
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes import accounts, transactions, assistant
from backend.database import engine, Base
from backend.plaid_client import handle_plaid_error
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

# any plaid error in any route turns into a normal error message for the app (see plaid_client.py)
app.add_exception_handler(plaid.ApiException, handle_plaid_error)

# when a request is missing something or has the wrong type, fastapi answers 422 with a list of what was wrong
# by default each problem also repeats back what was sent, that is taken out here because:
#  - a password that breaks a rule would get sent right back in the response
#  - a value like NaN can not be written as json, so the error response itself crashed into a 500
@app.exception_handler(RequestValidationError)
async def handle_validation_error(request, error: RequestValidationError):
    problems = [{key: value for key, value in problem.items() if key != "input"} for problem in error.errors()]
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(problems)})

app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(assistant.router)

# simple check to make sure the server is up
@app.get("/")
def root():
    return {"status": "backend is running"}

# notes:
# every new router file in routes/ needs to be imported and included here or the app will not see its end points
