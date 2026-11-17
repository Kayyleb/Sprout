// File: summary.js
// Adds up this month's totals from the sample data, this is what the assistant gets to see about the user's money
// once the backend can work these out from the database, the app will not need to send them anymore

import { total } from "./format";
import {
  currentMonth,
  purchases,
  deposits,
  bills,
  savingsAccounts,
  investmentAccounts,
  debts,
} from "../data/sampleData";

// only totals and debt names go in here, never account numbers or tokens (business rule 12)
// the field names match what the backend expects in routes/assistant.py
export function buildSummary() {
  return {
    month: currentMonth.name + " " + currentMonth.year,
    spending: total(purchases, "amount"),
    income: total(deposits, "amount"),
    bills: total(bills, "amount"),
    bills_paid: total(bills.filter((bill) => bill.paid), "amount"),
    savings: total(savingsAccounts, "balance") + total(investmentAccounts, "balance"),
    debt: total(debts, "balance"),
    debts: debts.map((debt) => ({
      name: debt.name,
      balance: debt.balance,
      apr: debt.apr,
      minimum: debt.minimum,
    })),
  };
}
