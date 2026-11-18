# File: models.py
# This file holds the database tables, each class in here is one table and each Column is one column in that table
# the classes come from the object model doc, the column names are the doc's attribute names in snake_case

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

# the current time in UTC, same thing datetime.utcnow() gave (that one is going away in newer python)
# the timezone is taken back off at the end because sqlite saves dates without one
def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


# a column that only takes one of a fixed list of words, the lists are the enumerations in appendix B of the object model
# the database itself turns away anything else, so a typo like "Manaul" can never get saved
def choice(name, *values, **column_options):
    return Column(Enum(*values, name=name, native_enum=False, create_constraint=True), **column_options)


# money is saved as a whole number of cents (balance_cents = 215000 is $2,150.00)
# sqlite has no exact decimal type, and cents can not pick up rounding errors the way 0.1 + 0.2 does with decimals
# the routes turn cents back into dollars before sending anything to the app


# the users table, one row for every person with a sprout account
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True) # unique id for the user, the database fills this in on its own
    username = Column(String, unique=True, nullable=False) # entered at sign up, no two users can share one
    email = Column(String, unique=True, nullable=False) # used to log in, also has to be unique
    password_hash = Column(String, nullable=False) # the bcrypt hash of the password, the real password is never saved
    email_verified = Column(Boolean, default=False) # turns true once the emailed code is confirmed
    failed_login_count = Column(Integer, default=0) # wrong passwords in a row, log in locks after 5
    locked_until = Column(DateTime, nullable=True) # when log in unlocks again, empty when the account is not locked
    created_date = Column(DateTime, default=utc_now) # date and time the account was created

    # everything the user owns, user.accounts gives a list of their accounts and so on
    # cascade means deleting a user deletes all of this too, nothing is left behind
    verification_codes = relationship("VerificationCode", back_populates="user", cascade="all, delete-orphan")
    bank_connections = relationship("BankConnection", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("FinancialAccount", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="user", cascade="all, delete-orphan")


# the 6 digit codes that get emailed for verifying an email, changing it, or resetting a password
# only a hash of the code is saved, the same way the password is
class VerificationCode(Base):
    __tablename__ = "verification_codes"

    code_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    code_hash = Column(String, nullable=False) # hash of the code, the plain code is never stored
    purpose = choice("verification_purpose", "EmailVerification", "EmailChange", "PasswordReset", nullable=False)
    sent_to = Column(String, nullable=False) # the email it went to (for EmailChange this is the new address)
    expires_at = Column(DateTime, nullable=False) # 10 minutes after it was sent
    attempts = Column(Integer, default=0, nullable=False) # wrong codes entered so far
    used = Column(Boolean, default=False, nullable=False) # true once it has been checked or replaced by a newer one
    created_date = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="verification_codes")


# one bank log in through plaid, a single log in can have several accounts under it (checking, savings, a card...)
class BankConnection(Base):
    __tablename__ = "bank_connections"

    connection_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    plaid_item_id = Column(String, unique=True, nullable=False) # plaid's id for this bank log in
    access_token_encrypted = Column(String, nullable=False) # the plaid access token, encrypted before it is saved (BR 6)
    institution_name = Column(String, nullable=False) # the bank's name, like First Platypus Bank
    status = choice("connection_status", "Active", "LoginRequired", default="Active", nullable=False) # LoginRequired when the bank wants the user to log in again
    linked_date = Column(DateTime, default=utc_now)
    last_sync_date = Column(DateTime, nullable=True) # last time new data came from plaid, empty until the first sync

    user = relationship("User", back_populates="bank_connections")
    # disconnecting does not delete the accounts here, the user picks keep or delete (decision 12) and the route does that
    accounts = relationship("FinancialAccount", back_populates="connection")


# every account the user has, linked or typed in by hand
# the object model has DepositAccount, InvestmentAccount and DebtAccount inheriting from FinancialAccount,
# here they are all one table, "kind" says which one a row is and the columns for the other kinds are left empty
class FinancialAccount(Base):
    __tablename__ = "accounts"

    account_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    # empty for manual accounts, and for linked accounts that were kept as manual after the bank was disconnected
    connection_id = Column(Integer, ForeignKey("bank_connections.connection_id", ondelete="SET NULL"), nullable=True)
    plaid_account_id = Column(String, unique=True, nullable=True) # plaid's id for the account, empty for manual ones
    kind = choice("account_kind", "Deposit", "Investment", "Debt", nullable=False)
    name = Column(String, nullable=False) # what the user sees, like High-Yield Savings
    institution_name = Column(String, nullable=True) # bank or lender name
    mask = Column(String, nullable=True) # last 4 digits of the account number, never the full number
    balance_cents = Column(Integer, default=0, nullable=False) # for a debt this is how much is owed
    source = choice("account_source", "Plaid", "Manual", nullable=False)
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

    # only for kind = Deposit
    deposit_type = choice("deposit_account_type", "Checking", "Savings", "HighYieldSavings", "CD", "MoneyMarket", nullable=True)

    # only for kind = Investment
    investment_type = choice("investment_account_type", "Brokerage", "Retirement", nullable=True)

    # only for kind = Debt
    debt_type = choice("debt_type", "CreditCard", "StudentLoan", "AutoLoan", "Mortgage", "PersonalLoan", "Other", nullable=True)
    interest_rate = Column(Float, nullable=True) # APR as a percent, 24.9 means 24.9%
    minimum_payment_cents = Column(Integer, nullable=True)
    next_due_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="accounts")
    connection = relationship("BankConnection", back_populates="accounts")
    holdings = relationship("Holding", back_populates="account", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="account")

    # savings counts deposit accounts other than checking, plus every investment (the hero on the savings screen)
    def counts_toward_savings(self):
        if self.kind == "Investment":
            return True
        return self.kind == "Deposit" and self.deposit_type != "Checking"


# one stock or fund inside an investment account
class Holding(Base):
    __tablename__ = "holdings"

    holding_id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.account_id", ondelete="CASCADE"), nullable=False, index=True)
    security_name = Column(String, nullable=False) # like Fidelity 500 Index Fund
    ticker_symbol = Column(String, nullable=True) # like FXAIX, can be empty for manual entries
    quantity = Column(Float, nullable=False) # shares can be fractions, like 2.5
    price_cents = Column(Integer, nullable=False) # latest price for one share
    last_updated = Column(DateTime, default=utc_now, onupdate=utc_now)

    account = relationship("FinancialAccount", back_populates="holdings")


# every purchase, deposit, payment and transfer, from plaid or typed in by hand
class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    # which account it came from, empty for manual entries like cash, and kept even if the account is deleted later
    account_id = Column(Integer, ForeignKey("accounts.account_id", ondelete="SET NULL"), nullable=True, index=True)
    # the bill this paid, if it was matched to one (decision 10), the link is cleared if the bill is deleted (decision 9)
    bill_id = Column(Integer, ForeignKey("bills.bill_id", ondelete="SET NULL"), nullable=True)
    plaid_transaction_id = Column(String, unique=True, nullable=True) # unique so syncing twice can not save the same one twice
    # always a positive number, transaction_type says which way the money went
    # (plaid sends money out as positive and money in as negative, so the sign gets taken off when saving)
    amount_cents = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=False) # from the bank, or what the user typed
    merchant_name = Column(String, nullable=True) # used to match payments to bills
    # what decides if it counts as spending (Purchase, BR 7) or income (Deposit, BR 8), the rest count as neither
    transaction_type = choice(
        "transaction_type", "Purchase", "Deposit", "BillPayment", "DebtPayment", "SavingsTransfer", "InternalTransfer",
        nullable=False,
    )
    deposit_type = choice("deposit_type", "DirectDeposit", "ATMCash", "Check", "PeerToPeer", nullable=True) # only for deposits
    category = Column(String, nullable=True) # display category from plaid or the user
    source = choice("transaction_source", "Plaid", "Manual", nullable=False)
    user_corrected = Column(Boolean, default=False, nullable=False) # true once the user recategorizes it, syncs leave it alone after that (decision 3)

    user = relationship("User", back_populates="transactions")
    account = relationship("FinancialAccount", back_populates="transactions")
    bill = relationship("Bill", back_populates="payments")


# bills on the bills calendar, found from the bank or typed in by the user
class Bill(Base):
    __tablename__ = "bills"

    bill_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    source_account_id = Column(Integer, ForeignKey("accounts.account_id", ondelete="SET NULL"), nullable=True) # the account it gets paid from
    name = Column(String, nullable=False) # like Rent
    amount_cents = Column(Integer, nullable=False) # how much each time it comes due
    due_date = Column(Date, nullable=False) # the next due date
    category = choice("bill_category", "Subscription", "Housing", "Mortgage", "CarPayment", "Other", nullable=False) # BR 10
    color = Column(String, nullable=True) # hex color on the calendar, empty means the category's default color
    recurrences_per_year = Column(Integer, default=12, nullable=False) # 12 is monthly, 1 is yearly (BR 15)
    source = choice("bill_source", "Detected", "Manual", nullable=False)
    merchant_name = Column(String, nullable=True) # used to match payments to this bill
    last_paid_date = Column(Date, nullable=True) # empty until it has been paid once

    user = relationship("User", back_populates="bills")
    source_account = relationship("FinancialAccount")
    payments = relationship("Transaction", back_populates="bill")

# notes:
# unique=True is what stops two accounts from using the same email or username, the database rejects the second one
# ondelete="CASCADE" deletes the row when the thing it belongs to is deleted, ondelete="SET NULL" just clears the link and keeps the row
# create_all only adds tables that do not exist yet, it never changes a table that is already there,
# so after changing a column, delete database/sprout.db and start the backend again (it is rebuilt empty)
# still to come with their features: notifications, devices, payoff plans and chat messages (see the object model)
# FinancialSummary is not a table, it is worked out from these tables when the app asks for it
