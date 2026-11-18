# File: test_plaid_routes.py
# Tests for the plaid end points in routes/accounts.py and routes/transactions.py
# plaid is never called for real here, the client is swapped for a stand in so the tests are free and work without keys

import json
from datetime import date

import plaid
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.routes import accounts, transactions

client = TestClient(app)


# what the plaid package throws when plaid says no, built the same way the package builds it
def plaid_error(status, body):
    error = plaid.ApiException(status=status, reason="test")
    error.body = body if isinstance(body, str) else json.dumps(body)
    return error


# a stand in for the plaid client, every call hands back the answer it was given or throws the error it was given
class FakePlaid:
    def __init__(self, answer=None, error=None):
        self.answer = answer
        self.error = error
        self.requests = []

    def _call(self, request):
        self.requests.append(request)
        if self.error:
            raise self.error
        return self.answer

    sandbox_public_token_create = _call
    item_public_token_exchange = _call
    accounts_balance_get = _call
    transactions_get = _call


# puts the stand in in place of the real client in both route files for one test
@pytest.fixture
def fake_plaid(monkeypatch):
    def use(**kwargs):
        fake = FakePlaid(**kwargs)
        monkeypatch.setattr(accounts, "client", fake)
        monkeypatch.setattr(transactions, "client", fake)
        return fake
    return use


# plaid hands back objects, these make small ones with only the fields the routes read
class Thing:
    def __init__(self, **fields):
        self.__dict__.update(fields)


def test_balances_keeps_only_the_fields_the_app_uses(fake_plaid):
    account = Thing(name="Plaid Checking", subtype="checking", balances=Thing(available=100.0, current=110.0), mask="0000")
    fake_plaid(answer=Thing(accounts=[account]))

    response = client.get("/balances", params={"access_token": "access-sandbox-123"})

    assert response.status_code == 200
    assert response.json() == {"accounts": [{"name": "Plaid Checking", "type": "checking", "available": 100.0, "current": 110.0}]}


def test_transactions_asks_for_the_right_dates(fake_plaid):
    fake = fake_plaid(answer=Thing(transactions=[Thing(date=date(2026, 11, 10), name="Uber", amount=5.4)]))

    response = client.get("/transactions", params={"access_token": "access-sandbox-123", "days": 7})

    assert response.status_code == 200
    assert response.json() == {"transactions": [{"date": "2026-11-10", "name": "Uber", "amount": 5.4}]}
    sent = fake.requests[0]
    assert (sent.end_date - sent.start_date).days == 7


def test_transactions_turns_down_a_bad_number_of_days(fake_plaid):
    fake = fake_plaid()

    for days in ["0", "-5", "731", "999999999", "abc"]:
        response = client.get("/transactions", params={"access_token": "access-sandbox-123", "days": days})
        assert response.status_code == 422, days

    assert fake.requests == []  # plaid was never asked


def test_a_plaid_error_comes_back_as_a_message_instead_of_a_crash(fake_plaid):
    fake_plaid(error=plaid_error(400, {"error_message": "provided access token is in an invalid format", "display_message": None}))

    response = client.get("/balances", params={"access_token": "nope"})

    assert response.status_code == 400
    assert response.json() == {"detail": "provided access token is in an invalid format"}


def test_plaids_message_for_users_is_used_when_there_is_one(fake_plaid):
    fake_plaid(error=plaid_error(400, {"error_message": "ITEM_LOGIN_REQUIRED", "display_message": "Log in to your bank again."}))

    response = client.post("/exchange-token", json={"public_token": "public-sandbox-123"})

    assert response.json() == {"detail": "Log in to your bank again."}


def test_plaid_being_down(fake_plaid):
    fake_plaid(error=plaid_error(500, "<html>bad gateway</html>"))  # not json at all

    response = client.post("/create-link-token")

    assert response.status_code == 502
    assert response.json() == {"detail": "The bank request did not go through. Try again in a moment."}


def test_validation_errors_do_not_repeat_back_what_was_sent():
    # once log in exists, a bad password should never come back in the error
    response = client.post("/exchange-token", json={"public_token": 12345})

    assert response.status_code == 422
    assert "input" not in response.json()["detail"][0]

# notes:
# monkeypatch puts the real client back after each test on its own
