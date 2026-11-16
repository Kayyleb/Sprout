# File: plaid_client.py
# This file will read from the secret env file and configure the plaid client to my plaid sandbox

import os
import plaid
from plaid.api import plaid_api
from dotenv import load_dotenv
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

# notes:
# separating the files makes sure that the setup code does not get repeated at all every time the app is opened or anything
