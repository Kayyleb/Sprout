from fastapi import APIRouter 
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from datetime import date, timedelta
from backend.plaid_client import client

router = APIRouter()

@router.get("/transactions")
def get_transactions(access_token: str, days: int = 30):
    end = date.today()
    start = end - timedelta(days=days) #calc date range

    #this builds the plaid request object
    req = TransactionsGetRequest( 
        access_token=access_token, # bank acc to pull from
        start_date=start, # start date for range
        end_date=end, # end date for range
        options=TransactionsGetRequestOptions(count=20), #returns maximum of x transactions
    )
    resp = client.transactions_get(req) # actually calls plaid

    # when plaid returns all the transaction info it will populate onlt these fields
    # later when the app is built we can take in more information such as merchent infor payment method, etc.
    txns = [
        {
            "date": str(t.date),
            "name": t.name,
            "amount": t.amount,
        }
        for t in resp.transactions
    ]
    # returns the data that plaid sends back. For now just return it to the json, but when we have sqlite setup will move there
    return {"transactions": txns}
