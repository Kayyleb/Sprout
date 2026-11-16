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
// returns null if it does not look like a real date
export function parseDate(text, order) {
  const parts = text.trim().split(/[\/\-.]/).map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  let y, m, d;
  if (order === "DMY") [d, m, y] = parts;
  else if (order === "YMD") [y, m, d] = parts;
  else [m, d, y] = parts;

  if (y < 1000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
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
