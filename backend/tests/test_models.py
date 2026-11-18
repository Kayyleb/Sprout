# File: test_models.py
# Tests for the database tables in models.py, mostly what happens when things get deleted and what the database turns away
# these use a brand new database that only lives in memory, so database/sprout.db is never touched

from datetime import date, datetime, timedelta

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models import User, VerificationCode, BankConnection, FinancialAccount, Holding, Transaction, Bill


# a fresh empty database for each test
@pytest.fixture
def db():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()
    engine.dispose()


def make_user(db, name="kayleb"):
    user = User(username=name, email=name + "@example.com", password_hash="not-a-real-hash")
    db.add(user)
    db.commit()
    return user


# one of everything, linked together the way a real user's data would be
def make_full_user(db):
    user = make_user(db)
    # autoflush is paused while the objects are built, otherwise sqlalchemy tries to save them half built
    with db.no_autoflush:
        connection = BankConnection(
            user=user, plaid_item_id="item-1", access_token_encrypted="encrypted", institution_name="First Platypus Bank"
        )
        checking = FinancialAccount(
            user=user, connection=connection, plaid_account_id="acc-1", kind="Deposit", deposit_type="Checking",
            name="Checking", balance_cents=11000, source="Plaid",
        )
        brokerage = FinancialAccount(
            user=user, kind="Investment", investment_type="Brokerage", name="Brokerage", balance_cents=160000, source="Manual",
            holdings=[Holding(security_name="Vanguard Total Stock Market", ticker_symbol="VTI", quantity=4, price_cents=29000)],
        )
        rent = Bill(
            user=user, name="Rent", amount_cents=85000, due_date=date(2026, 12, 1), category="Housing", source="Manual"
        )
        payment = Transaction(
            user=user, account=checking, bill=rent, plaid_transaction_id="txn-1", amount_cents=85000, date=date(2026, 11, 1),
            description="RENT PAYMENT", transaction_type="BillPayment", source="Plaid",
        )
        code = VerificationCode(
            user=user, code_hash="hash", purpose="EmailVerification", sent_to=user.email,
            expires_at=datetime(2026, 11, 18) + timedelta(minutes=10),
        )
        db.add_all([connection, checking, brokerage, rent, payment, code])
    db.commit()
    return user


def count(db, table):
    return db.execute(text("SELECT COUNT(*) FROM " + table)).scalar()


def test_a_user_and_everything_they_own_can_be_saved(db):
    user = make_full_user(db)

    assert len(user.accounts) == 2
    assert user.accounts[1].holdings[0].ticker_symbol == "VTI"
    assert user.bills[0].payments[0].description == "RENT PAYMENT"
    assert user.bank_connections[0].accounts[0].name == "Checking"
    assert user.verification_codes[0].attempts == 0  # defaults are filled in
    assert user.bank_connections[0].status == "Active"


def test_deleting_a_user_deletes_everything_they_own(db):
    user = make_full_user(db)

    db.delete(user)
    db.commit()

    for table in ["users", "verification_codes", "bank_connections", "accounts", "holdings", "transactions", "bills"]:
        assert count(db, table) == 0, table


def test_the_database_itself_deletes_a_users_rows_too(db):
    # the same thing, but straight in sql, so it works even if something skips sqlalchemy (this needs foreign keys turned on)
    make_full_user(db)

    db.execute(text("DELETE FROM users"))
    db.commit()

    for table in ["verification_codes", "bank_connections", "accounts", "holdings", "transactions", "bills"]:
        assert count(db, table) == 0, table


def test_disconnecting_a_bank_can_keep_its_accounts_as_manual(db):
    # decision 12, keep data: the connection goes away but the account and its transactions stay
    user = make_full_user(db)
    connection = user.bank_connections[0]
    checking = connection.accounts[0]

    checking.source = "Manual"
    db.delete(connection)
    db.commit()

    db.refresh(checking)
    assert checking.connection_id is None
    assert checking.source == "Manual"
    assert len(checking.transactions) == 1


def test_deleting_an_account_deletes_its_holdings_but_keeps_its_transactions(db):
    user = make_full_user(db)
    checking, brokerage = user.accounts

    db.delete(brokerage)
    db.delete(checking)
    db.commit()

    assert count(db, "holdings") == 0
    payment = db.query(Transaction).one()
    assert payment.account_id is None  # the purchase history is not lost


def test_deleting_a_bill_keeps_its_payments_but_unlinks_them(db):
    # decision 9
    user = make_full_user(db)

    db.delete(user.bills[0])
    db.commit()

    payment = db.query(Transaction).one()
    assert payment.bill_id is None


def test_values_outside_the_lists_are_turned_away(db):
    user = make_user(db)
    db.add(FinancialAccount(user=user, kind="Deposit", name="Typo", source="Manaul"))  # misspelled on purpose

    with pytest.raises(IntegrityError):
        db.commit()


def test_the_same_plaid_transaction_can_not_be_saved_twice(db):
    # so syncing with plaid twice does not double count spending
    user = make_user(db)
    for _ in range(2):
        db.add(Transaction(
            user=user, plaid_transaction_id="txn-1", amount_cents=500, date=date(2026, 11, 10),
            description="Uber", transaction_type="Purchase", source="Plaid",
        ))

    with pytest.raises(IntegrityError):
        db.commit()


def test_a_row_has_to_belong_to_a_real_user(db):
    db.add(Bill(user_id=999, name="Ghost", amount_cents=100, due_date=date(2026, 11, 1), category="Other", source="Manual"))

    with pytest.raises(IntegrityError):
        db.commit()


def test_which_accounts_count_toward_savings(db):
    def account(kind, **types):
        return FinancialAccount(kind=kind, name="x", source="Manual", **types)

    assert account("Deposit", deposit_type="Savings").counts_toward_savings()
    assert account("Deposit", deposit_type="CD").counts_toward_savings()
    assert account("Investment", investment_type="Retirement").counts_toward_savings()
    assert not account("Deposit", deposit_type="Checking").counts_toward_savings()  # checking is not savings
    assert not account("Debt", debt_type="CreditCard").counts_toward_savings()

# notes:
# create_engine("sqlite://") with nothing after the slashes makes a database that only lives in memory for that test
