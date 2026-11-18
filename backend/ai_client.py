# File: ai_client.py
# This file sets up the AI model that answers questions on the assistant screen, same idea as plaid_client.py but for google's gemini
# every call to the AI goes through ask() in this file, so switching to a different AI company later only means changing this one file

import os
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types

# the .env file sits in the project root, one folder above backend/
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

# which gemini model answers, flash-lite is on google's free tier
# to try a different one, set GEMINI_MODEL in .env (the model names are listed at https://aistudio.google.com/docs/models)
MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

# the most the AI can write in one answer, an answer on a phone screen should be well under this
MAX_ANSWER_TOKENS = 2048

# the instructions the AI gets before every conversation
# the user's numbers get added to the end of this in build_instructions()
INSTRUCTIONS = """You are the assistant inside Sprout, a budgeting app for students and people learning to manage money.
You help the user understand their own finances: spending, income, savings, debt and bills.

How to answer:
- Keep answers short, two to five sentences, because they are read on a phone.
- Write plain text only. No markdown, no headings, no bullet symbols, no bold. The app shows your text exactly as written.
- Use the user's numbers below when they help. Do not make up numbers that are not there, and say so when you need information you do not have.
- Explain money ideas simply, like you are talking to a college student.
- You are not a licensed financial advisor. For big decisions (taxes, investing large amounts, loans, legal questions) suggest talking to a professional.
- If the question has nothing to do with money or the app, politely bring the conversation back to their finances."""


# what gets thrown when the AI can not answer, the route turns it into an error message for the app
# status is the http status code the app should get back
class AssistantError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


# the client is only made the first time it is needed, so the backend still starts up when there is no key yet
_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise AssistantError(503, "The assistant is not set up yet. Add GEMINI_API_KEY to the .env file.")
        _client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=20_000,  # give up after 20 seconds (this setting is in milliseconds), the app waits 50 seconds for both tries
                # try once more if google's servers have a hiccup, but not on 429 (the free daily limit),
                # since waiting a few seconds does not bring a used up limit back
                retry_options=types.HttpRetryOptions(attempts=2, http_status_codes=[500, 502, 503, 504]),
            ),
        )
    return _client


# turns the user's numbers into text for the instructions
# summary is a dict of totals, only totals and debt names ever go to the AI, never account numbers or plaid tokens (business rule 12)
def build_instructions(summary: Optional[dict]) -> str:
    if not summary:
        return INSTRUCTIONS + "\n\nThe user's financial numbers are not available right now."

    lines = [
        "The user's finances for " + summary["month"] + " (US dollars):",
        "- Spent so far this month: " + _money(summary["spending"]),
        "- Income so far this month: " + _money(summary["income"]),
        "- Bills this month: " + _money(summary["bills"]) + ", of which " + _money(summary["bills_paid"]) + " are paid",
        "- Net income (income minus bills): " + _money(summary["income"] - summary["bills"]),
        "- Total savings and investments: " + _money(summary["savings"]),
        "- Total debt: " + _money(summary["debt"]),
    ]
    for debt in summary.get("debts", []):
        lines.append(
            "- Debt: " + debt["name"] + ", balance " + _money(debt["balance"])
            + ", " + str(debt["apr"]) + "% APR, minimum payment " + _money(debt["minimum"]) + " a month"
        )
    return INSTRUCTIONS + "\n\n" + "\n".join(lines)


# 1284.5 -> "$1,284.50"
def _money(amount: float) -> str:
    return "${:,.2f}".format(amount)


# turns the chat from the app into the shape gemini wants
# messages is a list like [{"role": "user", "text": "..."}, {"role": "assistant", "text": "..."}]
def build_contents(messages: List[dict]) -> List[types.Content]:
    contents: List[types.Content] = []
    for message in messages:
        role = "model" if message["role"] == "assistant" else "user"  # gemini calls the AI's side "model"

        # gemini wants the conversation to start with the user, so skip the hello message the app shows first
        if not contents and role == "model":
            continue

        # two messages in a row from the same side (a question after a failed one) get joined into one turn
        if contents and contents[-1].role == role:
            contents[-1].parts.append(types.Part.from_text(text=message["text"]))
        else:
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=message["text"])]))
    return contents


# sends the conversation to the AI and hands back its answer as plain text
def ask(messages: List[dict], summary: Optional[dict] = None) -> str:
    client = _get_client()
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=build_contents(messages),
            config=types.GenerateContentConfig(
                system_instruction=build_instructions(summary),
                max_output_tokens=MAX_ANSWER_TOKENS,
            ),
        )
    except errors.APIError as error:
        if error.code == 429:
            raise AssistantError(429, "The assistant has reached its free limit for now. Try again in a little while.")
        if error.code in (400, 401, 403) and "key" in str(error.message).lower():
            raise AssistantError(503, "The assistant's API key was not accepted. Check GEMINI_API_KEY in the .env file.")
        raise AssistantError(502, "The assistant could not answer right now. Try again in a moment.")
    except Exception:
        # the request never got an answer (no internet, timed out...)
        raise AssistantError(502, "The assistant could not answer right now. Try again in a moment.")

    # text is empty when the answer was blocked or got cut off before any text was written
    answer = (response.text or "").strip()
    if not answer:
        return "Sorry, I could not come up with an answer to that. Try asking it a different way."
    return answer

# notes:
# the free tier has a daily request limit and google may use what is sent to improve its products,
# fine while the app runs on sample data, but before real users it should move to the paid tier (or another company)
