# File: test_assistant.py
# Tests for the /assistant end point and ai_client.py
# the real AI is never called here, it is swapped for a stand in, so the tests are free and work without a key
# run every backend test from the project root with: pytest

import pytest
from fastapi.testclient import TestClient
from google.genai import errors

from backend import ai_client
from backend.main import app

client = TestClient(app)

QUESTION = [{"role": "user", "text": "Can I afford my bills?"}]

SUMMARY = {
    "month": "November 2026",
    "spending": 1284.5,
    "income": 3420,
    "bills": 1450,
    "bills_paid": 965,
    "savings": 18640.12,
    "debt": 14275,
    "debts": [{"name": "Credit Card", "balance": 2150, "apr": 24.9, "minimum": 65}],
}


# a stand in for the gemini client, it remembers what it was sent and hands back a made up answer
class FakeModels:
    def __init__(self, reply="You can afford them.", error=None):
        self.reply = reply
        self.error = error
        self.calls = []

    def generate_content(self, model, contents, config):
        self.calls.append({"model": model, "contents": contents, "config": config})
        if self.error:
            raise self.error

        class Response:
            text = self.reply

        return Response()


class FakeClient:
    def __init__(self, models):
        self.models = models


# puts the stand in in place of the real client for one test
@pytest.fixture
def fake_ai(monkeypatch):
    def use(**kwargs):
        models = FakeModels(**kwargs)
        monkeypatch.setattr(ai_client, "_client", FakeClient(models))
        return models
    yield use
    ai_client._client = None  # so the next test starts clean


def test_answers_a_question(fake_ai):
    models = fake_ai(reply="  Yes, you have $1,970.00 left after bills.  ")

    response = client.post("/assistant", json={"messages": QUESTION, "summary": SUMMARY})

    assert response.status_code == 200
    assert response.json() == {"reply": "Yes, you have $1,970.00 left after bills."}  # extra spaces trimmed
    assert models.calls[0]["model"] == ai_client.MODEL


def test_the_numbers_go_in_the_instructions(fake_ai):
    models = fake_ai()

    client.post("/assistant", json={"messages": QUESTION, "summary": SUMMARY})

    instructions = models.calls[0]["config"].system_instruction
    assert "$1,284.50" in instructions  # spending
    assert "$1,970.00" in instructions  # net income, 3,420 - 1,450
    assert "Credit Card, balance $2,150.00, 24.9% APR" in instructions


def test_works_without_a_summary(fake_ai):
    models = fake_ai()

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 200
    assert "not available" in models.calls[0]["config"].system_instruction


def test_the_chat_is_turned_into_gemini_turns(fake_ai):
    models = fake_ai()
    chat = [
        {"role": "assistant", "text": "Hi! Ask me anything."},  # the hello message, gemini needs the user to go first
        {"role": "user", "text": "How much did I spend?"},
        {"role": "assistant", "text": "$1,284.50 so far."},
        {"role": "user", "text": "Is that a lot?"},
        {"role": "user", "text": "Compared to my income?"},  # two in a row get joined into one turn
    ]

    client.post("/assistant", json={"messages": chat})

    contents = models.calls[0]["contents"]
    assert [turn.role for turn in contents] == ["user", "model", "user"]
    assert [part.text for part in contents[2].parts] == ["Is that a lot?", "Compared to my income?"]


def test_only_the_last_messages_are_sent(fake_ai):
    models = fake_ai()
    chat = []
    for number in range(30):
        chat.append({"role": "user", "text": "question " + str(number)})
        chat.append({"role": "assistant", "text": "answer " + str(number)})
    chat.append({"role": "user", "text": "last question"})

    client.post("/assistant", json={"messages": chat})

    sent = [part.text for turn in models.calls[0]["contents"] for part in turn.parts]
    assert len(sent) <= 20
    assert sent[-1] == "last question"
    assert "question 0" not in sent


def test_bad_requests_are_turned_down_before_the_ai_is_called(fake_ai):
    models = fake_ai()

    assert client.post("/assistant", json={"messages": []}).status_code == 422  # nothing to answer
    assert client.post("/assistant", json={"messages": [{"role": "user", "text": ""}]}).status_code == 422
    assert client.post("/assistant", json={"messages": [{"role": "user", "text": "x" * 2001}]}).status_code == 422
    assert client.post("/assistant", json={"messages": [{"role": "robot", "text": "hi"}]}).status_code == 422
    assert client.post("/assistant", json={"messages": [{"role": "user", "text": "   "}]}).status_code == 422  # only spaces

    # NaN is not allowed in normal json, but python's json can send it, and it used to crash the error response into a 500
    nan_body = '{"messages": [{"role": "user", "text": "hi"}], "summary": {"month": "Nov", "spending": NaN, "income": 1, "bills": 1, "bills_paid": 1, "savings": 1, "debt": 1}}'
    response = client.post("/assistant", content=nan_body, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == "Input should be a finite number"

    # the last message has to be a question from the user
    response = client.post("/assistant", json={"messages": [{"role": "assistant", "text": "hello"}]})
    assert response.status_code == 422
    assert response.json()["detail"] == "The last message has to be the user's question."

    assert models.calls == []


def test_says_so_when_there_is_no_key(monkeypatch):
    monkeypatch.setattr(ai_client, "_client", None)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


def test_the_free_limit_running_out(fake_ai):
    fake_ai(error=errors.ClientError(429, {"error": {"code": 429, "status": "RESOURCE_EXHAUSTED", "message": "Quota exceeded"}}))

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 429
    assert "free limit" in response.json()["detail"]


def test_a_bad_key(fake_ai):
    fake_ai(error=errors.ClientError(400, {"error": {"code": 400, "status": "INVALID_ARGUMENT", "message": "API key not valid. Please pass a valid API key."}}))

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 503
    assert "GEMINI_API_KEY" in response.json()["detail"]


def test_google_being_down(fake_ai):
    fake_ai(error=errors.ServerError(503, {"error": {"code": 503, "status": "UNAVAILABLE", "message": "overloaded"}}))

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 502
    assert "could not answer" in response.json()["detail"]


def test_an_empty_answer_gets_a_fallback(fake_ai):
    fake_ai(reply=None)

    response = client.post("/assistant", json={"messages": QUESTION})

    assert response.status_code == 200
    assert response.json()["reply"].startswith("Sorry, I could not come up with an answer")
