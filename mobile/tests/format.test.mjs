// File: format.test.mjs
// Tests for the money and date helpers in utils/format.js
// run every test from the mobile folder with: npm test

import test from "node:test";
import assert from "node:assert/strict";

import { money, total, formatDate, parseDate, datePlaceholder, dayOf, inMonth, plural, todayIso } from "../utils/format.js";

test("money writes amounts as US dollars", () => {
  assert.equal(money(1284.5), "$1,284.50");
  assert.equal(money(0), "$0.00");
  assert.equal(money(18640.12), "$18,640.12");
});

test("total adds up one field of a list", () => {
  assert.equal(total([{ amount: 10 }, { amount: 2.5 }], "amount"), 12.5);
  assert.equal(total([], "amount"), 0); // an empty list is 0, not an error
});

test("formatDate writes the date in the order from settings", () => {
  assert.equal(formatDate("2026-11-18", "MDY"), "11/18/2026");
  assert.equal(formatDate("2026-11-18", "DMY"), "18/11/2026");
  assert.equal(formatDate("2026-11-18", "YMD"), "2026/11/18");
});

test("datePlaceholder matches the order from settings", () => {
  assert.equal(datePlaceholder("MDY"), "Date (MM/DD/YYYY)");
  assert.equal(datePlaceholder("DMY"), "Date (DD/MM/YYYY)");
  assert.equal(datePlaceholder("YMD"), "Date (YYYY/MM/DD)");
});

test("parseDate reads what the user typed in each order", () => {
  assert.equal(parseDate("11/18/2026", "MDY"), "2026-11-18");
  assert.equal(parseDate("18/11/2026", "DMY"), "2026-11-18");
  assert.equal(parseDate("2026/11/18", "YMD"), "2026-11-18");
  assert.equal(parseDate(" 1-5-2026 ", "MDY"), "2026-01-05"); // dashes and extra spaces are fine
});

test("parseDate turns down things that are not real dates", () => {
  assert.equal(parseDate("", "MDY"), null);
  assert.equal(parseDate("tomorrow", "MDY"), null);
  assert.equal(parseDate("11/18", "MDY"), null); // no year
  assert.equal(parseDate("11/18/26", "MDY"), null); // two digit year
  assert.equal(parseDate("13/01/2026", "MDY"), null); // month 13
  assert.equal(parseDate("02/30/2026", "MDY"), null); // february 30th
  assert.equal(parseDate("11/31/2026", "MDY"), null); // november only has 30 days
  assert.equal(parseDate("02/29/2026", "MDY"), null); // 2026 is not a leap year
  assert.equal(parseDate("02/29/2028", "MDY"), "2028-02-29"); // 2028 is
});

test("parseDate and formatDate undo each other", () => {
  for (const order of ["MDY", "DMY", "YMD"]) {
    assert.equal(parseDate(formatDate("2026-11-05", order), order), "2026-11-05");
  }
});

test("dayOf and inMonth read a YYYY-MM-DD date", () => {
  const november = { year: 2026, month: 11 };
  assert.equal(dayOf("2026-11-05"), 5);
  assert.equal(inMonth("2026-11-05", november), true);
  assert.equal(inMonth("2026-12-05", november), false);
  assert.equal(inMonth("2025-11-05", november), false);
});

test("plural only adds the s when it is needed", () => {
  assert.equal(plural(1, "debt"), "1 debt");
  assert.equal(plural(3, "debt"), "3 debts");
  assert.equal(plural(0, "day"), "0 days");
});

test("todayIso is today's date as YYYY-MM-DD", () => {
  assert.match(todayIso(), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(parseDate(todayIso(), "YMD"), todayIso());
});
