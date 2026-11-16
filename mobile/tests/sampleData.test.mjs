// File: sampleData.test.mjs
// Checks that the made up numbers in data/sampleData.js agree with each other and with what the screens say
// if someone edits the sample data and a total stops matching, one of these fails

import test from "node:test";
import assert from "node:assert/strict";

import { total, inMonth, dayOf } from "../utils/format.js";
import {
  currentMonth,
  purchases,
  deposits,
  depositTypes,
  incomeWeeks,
  savingsAccounts,
  investmentAccounts,
  debts,
  payoffPlan,
  bills,
  billColors,
  assistantQuestions,
} from "../data/sampleData.js";

// money adds up with tiny rounding errors (0.1 + 0.2), so compare to the cent
const cents = (amount) => Math.round(amount * 100);

test("the totals shown on the home screen are the ones the assistant quotes", () => {
  assert.equal(cents(total(purchases, "amount")), cents(1284.5));
  assert.equal(total(deposits, "amount"), 3420);
  assert.equal(cents(total(savingsAccounts, "balance") + total(investmentAccounts, "balance")), cents(18640.12));
  assert.equal(total(debts, "balance"), 14275);
  assert.equal(total(bills, "amount"), 1450);
  assert.equal(total(bills.filter((bill) => bill.paid), "amount"), 965);
});

test("every dated item is inside the month the app is showing", () => {
  const dated = [
    ...purchases.map((item) => item.date),
    ...deposits.map((item) => item.date),
    ...bills.map((item) => item.date),
    ...debts.map((item) => item.dueDate),
  ];
  for (const date of dated) {
    assert.equal(inMonth(date, currentMonth), true, date + " is outside " + currentMonth.name);
  }
});

test("nothing has been spent or deposited after today", () => {
  for (const item of [...purchases, ...deposits]) {
    assert.ok(dayOf(item.date) <= currentMonth.today, item.date + " is in the future");
  }
});

test("every deposit has a known type and lands in exactly one week", () => {
  for (const deposit of deposits) {
    assert.ok(depositTypes[deposit.type], "unknown deposit type " + deposit.type);
    const day = dayOf(deposit.date);
    const weeks = incomeWeeks.filter((week) => day >= week.firstDay && day <= week.lastDay);
    assert.equal(weeks.length, 1, deposit.date + " should be in one week");
  }
});

test("each investment account balance matches its holdings", () => {
  for (const account of investmentAccounts) {
    const value = account.holdings.reduce((sum, holding) => sum + holding.shares * holding.price, 0);
    assert.equal(cents(value), cents(account.balance), account.name);
  }
});

test("the payoff plan covers every debt, pays at least the minimum and fits inside net income", () => {
  assert.equal(payoffPlan.steps.length, debts.length);
  for (const step of payoffPlan.steps) {
    const debt = debts.find((item) => item.name === step.name);
    assert.ok(debt, "no debt called " + step.name);
    assert.ok(step.monthly >= debt.minimum, step.name + " is under its minimum payment");
  }
  const netIncome = total(deposits, "amount") - total(bills, "amount");
  assert.ok(total(payoffPlan.steps, "monthly") <= netIncome);
});

test("every bill has a category with a color", () => {
  for (const bill of bills) {
    assert.ok(billColors[bill.category], bill.name + " has no color for " + bill.category);
  }
});

test("every suggested question has an answer", () => {
  for (const item of assistantQuestions) {
    assert.ok(item.question.length > 0 && item.answer.length > 0);
  }
});
