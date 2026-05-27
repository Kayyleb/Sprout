import os
import json
from dotenv import load_dotenv
from datetime import date, timedelta

import plaid
from plaid.api import plaid_api
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.identity_get_request import IdentityGetRequest
from plaid.model.products import Products
from plaid.model.country_code import CountryCode

load_dotenv()

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


# ── Step 1: Create a sandbox public token (simulates Plaid Link) ────────────
def create_sandbox_token(institution_id="ins_109508", products=None):
    """ins_109508 = First Platypus Bank (Plaid's sandbox test institution)"""
    if products is None:
        products = [Products("transactions"), Products("auth"), Products("identity")]

    req = SandboxPublicTokenCreateRequest(
        institution_id=institution_id,
        initial_products=products,
    )
    resp = client.sandbox_public_token_create(req)
    print(f"✅ Public token: {resp.public_token}")
    return resp.public_token


# ── Step 2: Exchange public token for a permanent access token ──────────────
def exchange_public_token(public_token):
    req = ItemPublicTokenExchangeRequest(public_token=public_token)
    resp = client.item_public_token_exchange(req)
    print(f"✅ Access token: {resp.access_token}")
    print(f"   Item ID:      {resp.item_id}")
    return resp.access_token


# ── Step 3: Get balances ────────────────────────────────────────────────────
def get_balances(access_token):
    req = AccountsBalanceGetRequest(access_token=access_token)
    resp = client.accounts_balance_get(req)
    print("\n💰 Account Balances:")
    for acct in resp.accounts:
        print(f"  {acct.name} ({acct.subtype}) — "
              f"Available: ${acct.balances.available}, "
              f"Current: ${acct.balances.current}")


# ── Step 4: Get transactions ────────────────────────────────────────────────
def get_transactions(access_token, days=30):
    end = date.today()
    start = end - timedelta(days=days)

    req = TransactionsGetRequest(
        access_token=access_token,
        start_date=start,
        end_date=end,
        options=TransactionsGetRequestOptions(count=10),
    )
    resp = client.transactions_get(req)
    print(f"\n📋 Recent Transactions (last {days} days):")
    for txn in resp.transactions:
        print(f"  {txn.date}  {txn.name:<40} ${txn.amount:.2f}")


# ── Step 5: Get auth (account + routing numbers) ────────────────────────────
def get_auth(access_token):
    req = AuthGetRequest(access_token=access_token)
    resp = client.auth_get(req)
    print("\n🏦 Auth (Account & Routing Numbers):")
    for num in resp.numbers.ach:
        print(f"  Account: {num.account}  Routing: {num.routing}")


# ── Step 6: Get identity ────────────────────────────────────────────────────
def get_identity(access_token):
    req = IdentityGetRequest(access_token=access_token)
    resp = client.identity_get(req)
    print("\n👤 Identity:")
    for acct in resp.accounts:
        for owner in acct.owners:
            for name in owner.names:
                print(f"  Name: {name}")
            for addr in owner.addresses:
                d = addr.data
                print(f"  Address: {d.street}, {d.city}, {d.region} {d.postal_code}")


# ── Main ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== Plaid Sandbox CLI ===\n")

    # 1. Simulate Plaid Link → get public token
    public_token = create_sandbox_token()

    # 2. Exchange for access token
    access_token = exchange_public_token(public_token)

    # 3. Run all the things
    get_balances(access_token)
    get_transactions(access_token)
    get_auth(access_token)
    get_identity(access_token)