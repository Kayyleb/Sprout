# File: accounts.py
# This is the account router, which will act like an end point for the app, for organization

#python imports: 
from fastapi import APIRouter
from plaid.model.sandbox_public_token_create_request import SandboxPublicTokenCreateRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.products import Products
from backend.plaid_client import client

router = APIRouter()

@router.post("/create-link-token") # this will connect with plaid's link service where they will be able to connect accoutns through the app 
def create_link_token():
    req = SandboxPublicTokenCreateRequest(
        institution_id="ins_109508",
        initial_products=[Products("transactions"), Products("auth")],
    )
    resp = client.sandbox_public_token_create(req)
    return {"public_token": resp.public_token} # will change this to save to database, for right now just going to return it 

@router.post("/exchange-token")
def exchange_token(body: dict):
    req = ItemPublicTokenExchangeRequest(public_token=body["public_token"])
    resp = client.item_public_token_exchange(req)

    return {"access_token": resp.access_token} # will change this to save to database, for right now just going to return it 

@router.get("/balances") # grab's account balances from the users
def get_balances(access_token: str):
    req = AccountsBalanceGetRequest(access_token=access_token)
    resp = client.accounts_balance_get(req)
    accounts = [
        {
            "name": a.name,
            "type": str(a.subtype),
            "available": a.balances.available,
            "current": a.balances.current,
        }
        for a in resp.accounts
    ]
    return {"accounts": accounts} # will change this to save to database, for right now just going to return it 

# notes:
# this files purpose is for organization and does everything with the user's account, it will connect to link to connect the accounts
#                                                                                       then return thier account token and pull all of their information into the database