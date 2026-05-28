from fastapi import APIRouter
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from datetime import date, timedelta
from backend.plaid_client import client

router = APIRouter()

@router.get("/transactions")
def get_transactions(access_token: str, days: int = 30):
    end = date.today()
    start = end - timedelta(days=days)
    req = TransactionsGetRequest(
        access_token=access_token,
        start_date=start,
        end_date=end,
        options=TransactionsGetRequestOptions(count=20),
    )
    resp = client.transactions_get(req)
    txns = [
        {
            "date": str(t.date),
            "name": t.name,
            "amount": t.amount,
        }
        for t in resp.transactions
    ]
    return {"transactions": txns}