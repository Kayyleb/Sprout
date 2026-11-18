// File: sampleData.js
// All of the made up numbers the screens show until the backend has endpoints for them
// when the real data is ready, each of these lists is what gets swapped out for a call in api.js

// the logged in user, shown on the settings screen
export const user = {
  username: "kayleb",
  email: "kayleb@example.com",
};

// the app is always showing November 2026 for now, and pretends today is the 15th
export const currentMonth = {
  year: 2026,
  month: 11,
  name: "November",
  shortName: "Nov",
  today: 15,
};

// ---- SPENDING ----
// every purchase this month and the account it came from
// bills, debt payments and savings transfers are not in here
export const purchases = [
  { date: "2026-11-01", name: "Dutch Bros", account: "Checking ••4821", amount: 42.10 },
  { date: "2026-11-03", name: "Amazon", account: "Credit Card ••0937", amount: 18.75 },
  { date: "2026-11-04", name: "Chipotle", account: "Checking ••4821", amount: 53.02 },
  { date: "2026-11-04", name: "Target", account: "Credit Card ••0937", amount: 28.92 },
  { date: "2026-11-04", name: "Fred Meyer", account: "Checking ••4821", amount: 14.46 },
  { date: "2026-11-05", name: "Target", account: "Credit Card ••0937", amount: 12.00 },
  { date: "2026-11-06", name: "Fred Meyer", account: "Checking ••4821", amount: 84.87 },
  { date: "2026-11-06", name: "Dutch Bros", account: "Checking ••4821", amount: 46.29 },
  { date: "2026-11-06", name: "Chevron", account: "Credit Card ••0937", amount: 23.14 },
  { date: "2026-11-07", name: "Dutch Bros", account: "Checking ••4821", amount: 115.64 },
  { date: "2026-11-07", name: "Chevron", account: "Credit Card ••0937", amount: 63.08 },
  { date: "2026-11-07", name: "Amazon", account: "Credit Card ••0937", amount: 31.53 },
  { date: "2026-11-08", name: "Chevron", account: "Credit Card ••0937", amount: 33.60 },
  { date: "2026-11-10", name: "Chipotle", account: "Checking ••4821", amount: 39.13 },
  { date: "2026-11-10", name: "Target", account: "Credit Card ••0937", amount: 21.35 },
  { date: "2026-11-10", name: "Fred Meyer", account: "Checking ••4821", amount: 10.67 },
  { date: "2026-11-11", name: "Target", account: "Credit Card ••0937", amount: 48.90 },
  { date: "2026-11-12", name: "Fred Meyer", account: "Checking ••4821", amount: 67.13 },
  { date: "2026-11-12", name: "Dutch Bros", account: "Checking ••4821", amount: 36.61 },
  { date: "2026-11-12", name: "Chevron", account: "Credit Card ••0937", amount: 18.31 },
  { date: "2026-11-13", name: "Dutch Bros", account: "Checking ••4821", amount: 145.75 },
  { date: "2026-11-13", name: "Chevron", account: "Credit Card ••0937", amount: 79.50 },
  { date: "2026-11-13", name: "Amazon", account: "Credit Card ••0937", amount: 39.75 },
  { date: "2026-11-14", name: "Chevron", account: "Credit Card ••0937", amount: 48.13 },
  { date: "2026-11-14", name: "Amazon", account: "Credit Card ••0937", amount: 26.25 },
  { date: "2026-11-14", name: "Chipotle", account: "Checking ••4821", amount: 13.12 },
  { date: "2026-11-15", name: "Amazon", account: "Credit Card ••0937", amount: 67.38 },
  { date: "2026-11-15", name: "Chipotle", account: "Checking ••4821", amount: 36.75 },
  { date: "2026-11-15", name: "Target", account: "Credit Card ••0937", amount: 18.37 },
];

// ---- INCOME ----
// the four deposit types that count as income, each with its own color on the weekly bars
export const depositTypes = {
  direct: { label: "Direct deposit", color: "#009e2a" },
  atm: { label: "ATM cash", color: "#2f80ed" },
  check: { label: "Check", color: "#f2994a" },
  p2p: { label: "Peer-to-peer", color: "#7b61ff" },
};

// every deposit this month
export const deposits = [
  { date: "2026-11-06", type: "direct", amount: 1450 },
  { date: "2026-11-10", type: "check", amount: 200 },
  { date: "2026-11-12", type: "p2p", amount: 120 },
  { date: "2026-11-15", type: "direct", amount: 1450 },
  { date: "2026-11-15", type: "atm", amount: 200 },
];

// how the month is split into weeks on the income screen
export const incomeWeeks = [
  { name: "Week 1", firstDay: 1, lastDay: 7 },
  { name: "Week 2", firstDay: 8, lastDay: 14 },
  { name: "Week 3", firstDay: 15, lastDay: 21 },
  { name: "Week 4", firstDay: 22, lastDay: 31 }, // runs to the 31st so a long month does not lose its last day
];

// ---- SAVINGS ----
// regular savings accounts, checking is not counted as savings
export const savingsAccounts = [
  { name: "High-Yield Savings", detail: "First Platypus Bank ••7730", balance: 6200.00 },
  { name: "Savings", detail: "First Platypus Bank ••1164", balance: 1840.12 },
  { name: "CD", detail: "First Platypus Bank ••5502", balance: 3000.00 },
  { name: "Money Market", detail: "Added manually", balance: 2100.00 },
];

// investment accounts, these open up on the savings screen to show what is inside them
export const investmentAccounts = [
  {
    name: "Retirement",
    detail: "Roth IRA ••9087",
    balance: 3900.00,
    holdings: [{ symbol: "FXAIX", shares: 20, price: 195.00 }],
  },
  {
    name: "Investment",
    detail: "Brokerage ••3318",
    balance: 1600.00,
    holdings: [
      { symbol: "VTI", shares: 4, price: 290.00 },
      { symbol: "AAPL", shares: 2, price: 220.00 },
    ],
  },
];

// ---- DEBT ----
export const debts = [
  { name: "Student Loan", apr: 5.5, minimum: 110, dueDate: "2026-11-28", balance: 9400 },
  { name: "Auto Loan", apr: 7.2, minimum: 185, dueDate: "2026-11-18", balance: 2725 },
  { name: "Credit Card", apr: 24.9, minimum: 65, dueDate: "2026-11-22", balance: 2150 },
];

// the payoff plan the assistant came up with, in the order the debts get paid off
export const payoffPlan = {
  strategy:
    "Your credit card has the highest interest by far, so the extra money goes there first while the loans stay on their minimum payments. Once the card is gone, that payment rolls into the auto loan.",
  steps: [
    { name: "Credit Card", paidOff: "Sep 2027", monthly: 225 },
    { name: "Auto Loan", paidOff: "Jun 2028", monthly: 185 },
    { name: "Student Loan", paidOff: "Aug 2029", monthly: 110 },
  ],
  debtFree: "August 2029",
};

// ---- BILLS ----
// default color for each kind of bill, used for the dots on the calendar
export const billColors = {
  Subscription: "#7b61ff",
  Housing: "#2f80ed",
  Mortgage: "#00a3a3",
  "Car Payment": "#f2994a",
  Other: "#8a938c",
};

// some of these would be detected from the bank and some typed in by the user
export const bills = [
  { date: "2026-11-01", name: "Rent", amount: 850, category: "Housing", timesPerYear: 12, paid: true },
  { date: "2026-11-05", name: "Spotify", amount: 12, category: "Subscription", timesPerYear: 12, paid: true },
  { date: "2026-11-09", name: "Netflix", amount: 18, category: "Subscription", timesPerYear: 12, paid: true },
  { date: "2026-11-12", name: "Phone", amount: 85, category: "Other", timesPerYear: 12, paid: true },
  { date: "2026-11-18", name: "Car Payment", amount: 185, category: "Car Payment", timesPerYear: 12, paid: false },
  { date: "2026-11-20", name: "Internet", amount: 60, category: "Other", timesPerYear: 12, paid: false },
  { date: "2026-11-25", name: "Gym", amount: 40, category: "Subscription", timesPerYear: 12, paid: false },
  { date: "2026-11-27", name: "Electric", amount: 200, category: "Housing", timesPerYear: 12, paid: false },
];

// ---- SETTINGS ----
// banks that are already connected through plaid
export const linkedBanks = [
  { name: "First Platypus Bank", accounts: 5, linkedDate: "2026-11-02" },
  { name: "Platypus Investments", accounts: 2, linkedDate: "2026-11-04" },
];

// what api.js hands back for GET /balances while DEMO_MODE is on, same shape the backend returns
export const demoBankAccounts = [
  { name: "Plaid Checking", type: "depository", available: 100, current: 110 },
  { name: "Plaid Saving", type: "depository", available: 200, current: 210 },
  { name: "Plaid Credit Card", type: "credit", available: null, current: 410 },
];

// ---- ASSISTANT ----
export const assistantHello =
  "Hi! I can help you understand your budget. Ask me anything, or pick one of the questions below.";

// what the assistant says to anything that is not one of the suggested questions, only used when ASSISTANT_DEMO_MODE is on in api.js
export const assistantFallback =
  "In demo mode I only know the suggested questions. Turn off ASSISTANT_DEMO_MODE in api.js to ask me anything.";

// suggested questions, and the canned answer for each that is used when ASSISTANT_DEMO_MODE is on in api.js
export const assistantQuestions = [
  {
    question: "How much did I spend this month?",
    answer:
      "So far in November you have spent $1,284.50. Your biggest day was the 13th at $265.00. That does not count bills, debt payments or transfers to savings.",
  },
  {
    question: "Can I afford my bills?",
    answer:
      "Yes. Your bills come to $1,450.00 this month and you have brought in $3,420.00, which leaves $1,970.00. You still have $485.00 of bills left to pay.",
  },
  {
    question: "How should I pay off my debt?",
    answer:
      "Your credit card is at 24.9% APR, so I would put extra money there first: $225.00 a month on the card and the minimums on your two loans. That has you debt free around August 2029.",
  },
  {
    question: "Am I saving enough?",
    answer:
      "You have $18,640.12 saved across 6 accounts. With $1,970.00 left after bills and about $1,285 in spending, you could move around $150 a month into your high-yield savings.",
  },
];
