// File: format.js
// Small helpers for writing out money and dates the same way on every screen

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// 1284.5 -> "$1,284.50"
export function money(amount) {
  return currency.format(amount);
}

// adds up one field of every item in a list, example: total(bills, "amount")
export function total(list, field) {
  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum = sum + list[i][field];
  }
  return sum;
}

// takes a date written as YYYY-MM-DD and writes it in the order the user picked in settings
export function formatDate(iso, order) {
  const [y, m, d] = iso.split("-");
  if (order === "DMY") return d + "/" + m + "/" + y;
  if (order === "YMD") return y + "/" + m + "/" + d;
  return m + "/" + d + "/" + y;
}

// the hint shown inside the date boxes on the add forms
export function datePlaceholder(order) {
  if (order === "DMY") return "Date (DD/MM/YYYY)";
  if (order === "YMD") return "Date (YYYY/MM/DD)";
  return "Date (MM/DD/YYYY)";
}

// the opposite of formatDate, turns what the user typed back into YYYY-MM-DD
// returns null if it is not a real date (wrong shape, month 13, february 30th...)
export function parseDate(text, order) {
  const parts = text.trim().split(/[\/\-.]/).map(Number);
  if (parts.length !== 3 || !parts.every(Number.isInteger)) return null;

  let y, m, d;
  if (order === "DMY") [d, m, y] = parts;
  else if (order === "YMD") [y, m, d] = parts;
  else [m, d, y] = parts;

  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1) return null;

  // day 0 of the next month is the last day of this one, so this is how many days the month has
  const daysInMonth = new Date(y, m, 0).getDate();
  if (d > daysInMonth) return null;

  return toIso(y, m, d);
}

// puts a year, month and day together as YYYY-MM-DD
function toIso(y, m, d) {
  return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}

// today as YYYY-MM-DD, using the date on the phone (not the UTC date, which can be a day off in the evening)
export function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

// writes a count with its word, adding the s when it is needed: plural(1, "debt") -> "1 debt", plural(3, "debt") -> "3 debts"
export function plural(count, word) {
  return count + " " + word + (count === 1 ? "" : "s");
}

// "2026-11-18" -> 18
export function dayOf(iso) {
  return Number(iso.split("-")[2]);
}

// true when a YYYY-MM-DD date lands in the month the app is showing
export function inMonth(iso, month) {
  const [y, m] = iso.split("-");
  return Number(y) === month.year && Number(m) === month.month;
}
