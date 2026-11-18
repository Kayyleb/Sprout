# File: assistant.py
# This is the assistant router, the end point the assistant screen in the app sends questions to

#python imports:
from typing import Annotated, List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from backend import ai_client

router = APIRouter()

# only the last few messages are sent to the AI, so a long chat does not use up the free limit faster
HISTORY_LIMIT = 20


# text with the spaces trimmed off the ends, a message of only spaces counts as empty and gets turned away
MessageText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]

# the numbers have to be real numbers, json from some apps can sneak in NaN or Infinity which would end up as "$nan" for the AI
FINITE_NUMBERS = ConfigDict(allow_inf_nan=False)


# one message in the chat, role is who said it
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: MessageText


# one debt, used for questions about paying debt off
class DebtSummary(BaseModel):
    model_config = FINITE_NUMBERS
    name: str = Field(max_length=100)
    balance: float
    apr: float
    minimum: float


# the user's totals for the month, the app sends these until the backend can work them out from the database
# there is no account number or token in here on purpose (business rule 12)
class FinancialSummary(BaseModel):
    model_config = FINITE_NUMBERS
    month: str = Field(max_length=40)
    spending: float
    income: float
    bills: float
    bills_paid: float
    savings: float
    debt: float
    debts: List[DebtSummary] = Field(default_factory=list, max_length=20)


# what /assistant expects in the body, fastapi checks it before the AI is ever called
class AssistantRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=100)
    summary: Optional[FinancialSummary] = None


# sends the chat to the AI and gives back its answer
@router.post("/assistant")
def ask_assistant(body: AssistantRequest):
    if body.messages[-1].role != "user":
        raise HTTPException(status_code=422, detail="The last message has to be the user's question.")

    messages = [message.model_dump() for message in body.messages[-HISTORY_LIMIT:]]
    summary = body.summary.model_dump() if body.summary else None

    try:
        reply = ai_client.ask(messages, summary)
    except ai_client.AssistantError as error:
        raise HTTPException(status_code=error.status, detail=error.message)

    return {"reply": reply}

# notes:
# nothing is saved yet, the app sends the whole chat each time. once log in is done the chat history (ChatMessage in the
# object model) can be saved per user, and the summary can come from the database instead of from the app
