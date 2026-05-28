# File: Plaid_Client
# This file will read from the secret env file and configure the plaid client to my plaid sandbox

import os 
import plaid
from plaid.api import plaid_api
from dotenv import load_dotenv
from pathlib import path

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
client = plaid_api.PlaidApi(api_client)

#notes:
#seperating the files make sure that the setup code does not get repeated at all everytime the app is opened or anything
