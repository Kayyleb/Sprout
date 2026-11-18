# Sprout

Sprout is a personal finance and budgeting app for iOS and Android. It gives people one place to see their spending, income, savings, debt and bills, with an AI assistant to help make sense of it. It is a senior project by Kayleb Cook (KCProductions).

The project has two parts:

- **`mobile/`** is the app itself, built with React Native and Expo.
- **`backend/`** is a Python server built with FastAPI. It talks to Plaid for bank data and stores accounts in a SQLite database.

## Where the project is right now

The project is in early development. This is what works today and what does not.

| Area | Status |
| --- | --- |
| App screens (log in, create account, home, spending, income, savings, debt, bills, assistant, settings) | Built, showing sample data |
| Display settings (dark mode, font size, hide account values, date order) | Working, saved on the phone |
| Plaid sandbox (link a test bank, read balances and transactions) | Working in the backend |
| Database | Set up with a `users` table |
| Log in and create account | Screens are built, backend endpoints are in progress |
| Real financial data on the screens | Not started |
| AI assistant | Working, answered by Google Gemini (free tier) using the sample numbers |
| Email verification, notifications | Required, not started |

Until the backend endpoints are finished, the app runs in **demo mode**: any email and password logs in, and every number on screen comes from `mobile/data/sampleData.js`.

## What you need

- **Node.js 22.13 or newer** (required by Expo SDK 57)
- **Python 3.15 or newer** (on a Mac: `brew install python@3.15`)
- **Xcode with an iOS simulator** (Mac), or an Android emulator
- **A free Plaid account**, for the sandbox keys. Only needed to run the backend.

## Setup

Clone the repository, then set up each part once.

### Backend

From the project root:

```bash
python3.15 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and fill in:

- `PLAID_CLIENT_ID` and `PLAID_SECRET`, the sandbox keys from the [Plaid dashboard](https://dashboard.plaid.com).
- `GEMINI_API_KEY`, a free key from [Google AI Studio](https://aistudio.google.com/apikey). The assistant needs it; everything else works without it.

The `.env` file is never committed.

### Mobile app

```bash
cd mobile
npm install
```

## Running it

Use two terminals.

**Terminal 1, the backend** (from the project root):

```bash
source venv/bin/activate
uvicorn backend.main:app --reload
```

The server runs at `http://localhost:8000`. Opening `http://localhost:8000/docs` shows every endpoint and lets you try them. The first start creates the database file at `database/sprout.db`.

**Terminal 2, the app:**

```bash
cd mobile
npm start
```

Press `i` to open the iOS simulator or `a` for the Android emulator.

In demo mode the app does not need the backend at all, so Terminal 2 on its own is enough to look around.

### Turning demo mode off

`mobile/api.js` has two settings at the top:

```js
export const API_URL = "http://localhost:8000";
export const DEMO_MODE = true;
```

Set `DEMO_MODE` to `false` and the app calls the backend for log in, create account and bank linking. `/login` should answer with `{"token": "..."}`. After that the app sends the token with every request as an `Authorization: Bearer <token>` header, and forgets it on log out.

The assistant has its own switch in the same file, `ASSISTANT_DEMO_MODE`, which is `false`. The assistant screen sends questions to the backend, so the backend needs to be running with `GEMINI_API_KEY` set. Set it to `true` to get the old canned answers without the backend.

`localhost` only works on a simulator running on the same computer as the backend. To use a real phone, change `API_URL` to your computer's network address (for example `http://192.168.1.20:8000`) and start the backend with `--host 0.0.0.0`.

## Tests

**App** (71 tests: the money and date helpers, the email and password rules, a check that the sample data adds up, the network code in `api.js`, tests that tap through every screen and try bad input on every form, and a check that settings are saved):

```bash
cd mobile
npm test
```

**Backend** (18 tests for the assistant and Plaid end points, including bad requests and Plaid errors), from the project root:

```bash
source venv/bin/activate
pip install -r requirements-dev.txt
pytest
```

Neither set of tests calls Plaid or the AI for real, so they are free and work without any keys.

Both run automatically on GitHub for every push to `main` and every pull request. The setup is in `.github/workflows/tests.yml`.

## Project layout

```
backend/
  main.py            entry point, creates the app and the database tables
  ai_client.py       the AI assistant setup, every call to Gemini goes through here
  database.py        connection to the SQLite database
  models.py          database tables (User)
  plaid_client.py    Plaid setup, reads the keys from .env
  routes/            one file per group of endpoints (accounts, transactions, assistant)
  tests/             backend tests
mobile/
  App.js             navigation, lists every screen
  api.js             all network calls, and the demo mode switch
  theme.js           colors and spacing for light and dark mode
  navigation/screens/  one file per screen
  components/        shared pieces (cards, rows, calendar, tab bar, icons)
  context/           display settings shared by every screen
  data/              sample data used until the backend is ready
  utils/             money, date and validation helpers
  tests/             automated tests
  assets/            logo, app icon and the icons used in the app
database/            where sprout.db is created (the file is not committed)
docs/                proposal, use case model and object model
plaid-sandbox/       the original command line test of the Plaid sandbox
```

## Backend endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/` | Confirms the server is running |
| POST | `/create-link-token` | Creates a Plaid sandbox public token |
| POST | `/exchange-token` | Swaps a public token for an access token |
| GET | `/balances` | Account balances for an access token |
| GET | `/transactions` | Recent transactions for an access token |
| POST | `/assistant` | Sends the chat and the month's totals to the AI and returns its answer |

The Plaid endpoints currently return Plaid data directly. They will change to save to the database and to require a logged-in user.

## Design documents

The planning documents are in `docs/`:

- **Sprout Proposal** covers the requirements, platforms and libraries.
- **Sprout Use Case Model** covers each thing a user can do, step by step, and the business rules.
- **Sprout Object Model** covers the classes, their fields, and the design decisions.

## Common problems

- **"Could not reach the server"** in the app: the backend is not running, or `API_URL` points somewhere the phone cannot reach.
- **The assistant says it is not set up yet:** add `GEMINI_API_KEY` to `.env` and restart the backend.
- **The assistant says it reached its free limit:** the Gemini free tier has a daily request limit. It resets at midnight Pacific time.
- **Plaid errors when linking a bank:** check that `.env` exists in the project root and has both keys.
- **The app icon or splash screen has not changed:** Expo Go always shows its own. They only appear in a development or production build.
- **A database change is not showing up:** stop the backend, delete `database/sprout.db`, and start it again. The tables are rebuilt empty.
