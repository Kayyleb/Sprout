# File: plaid_client.py
# This file will read from the secret env file and configure the plaid client to my plaid sandbox

import json
import os
import plaid
from plaid.api import plaid_api
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from pathlib import Path

# the .env file sits in the project root, one folder above backend/
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# ── Configure Plaid client ──────────────────────────────────────────────────
configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        "clientId": os.getenv("PLAID_CLIENT_ID"),
        "secret":   os.getenv("PLAID_SECRET"),
    }
)
api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client) # the routes import this to talk to plaid


# when plaid says no (bad token, bank needs the user to log in again...) the plaid package throws an ApiException
# main.py sends every one of those here, so the app gets plaid's reason as {"detail": "..."} instead of a blank 500 error
def handle_plaid_error(request, error: plaid.ApiException):
    message = "The bank request did not go through. Try again in a moment."
    try:
        body = json.loads(error.body)
        # display_message is the one plaid writes for users, it is often empty so error_message is the backup
        message = body.get("display_message") or body.get("error_message") or message
    except (TypeError, ValueError):
        pass  # the body was not json, keep the general message

    # plaid's 400s and 429s are about the request so they get passed along, anything else is plaid's side having trouble
    status = error.status if error.status in (400, 429) else 502
    return JSONResponse(status_code=status, content={"detail": message})

# notes:
# separating the files makes sure that the setup code does not get repeated at all every time the app is opened or anything
