// File: screens.test.js
// Tests that open each screen and tap through it the way a user would, to make sure the buttons and forms do what they should
// these run against the sample data, and the network calls in api.js are swapped for stand ins, so the backend does not need to be running

import { Alert } from "react-native";
import { render, screen, fireEvent, act } from "@testing-library/react-native";

import { SettingsProvider } from "../context/SettingsContext";
import Login from "../navigation/screens/Login";
import Signup from "../navigation/screens/Signup";
import Main from "../navigation/screens/Main";
import Home from "../navigation/screens/Home";
import Spending from "../navigation/screens/Spending";
import Income from "../navigation/screens/Income";
import Savings from "../navigation/screens/Savings";
import Debt from "../navigation/screens/Debt";
import Bills from "../navigation/screens/Bills";
import Assistant from "../navigation/screens/Assistant";
import Settings from "../navigation/screens/Settings";
import { login, createAccount } from "../api";

// stand ins for the functions in api.js, they answer right away the same way the backend would on a good day
// a test can make one fail to see what the screen does, example: login.mockRejectedValueOnce(new Error("..."))
jest.mock("../api", () => ({
  login: jest.fn(async () => ({ token: "test-token" })),
  createAccount: jest.fn(async () => ({ user_id: 1 })),
  linkBankAccount: jest.fn(async () => "test-access-token"),
  getBalances: jest.fn(async () => [{ name: "Checking" }, { name: "Savings" }, { name: "Credit Card" }]),
}));

// the tests do not run on a real phone, so use the stand in that the safe area package ships for tests
jest.mock("react-native-safe-area-context", () => require("react-native-safe-area-context/jest/mock").default);

// a pretend navigation object, the tests check which of these the screen called
function fakeNavigation() {
  return {
    navigate: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };
}

// every screen reads the display settings, so each one is opened inside the settings provider like in App.js
function open(screenToOpen) {
  return render(<SettingsProvider>{screenToOpen}</SettingsProvider>);
}

// alerts can not pop up in a test, so they are swapped for a stand in that just remembers what it was asked to show
beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

// waits one second for the assistant's pause before it answers
// doing the wait inside act() tells the test that the screen is allowed to change during it
async function waitASecond() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
}

// ---- LOG IN ----
test("log in asks for both fields before doing anything", async () => {
  const navigation = fakeNavigation();
  await open(<Login navigation={navigation} />);

  await fireEvent.press(screen.getByText("Sign In"));

  expect(Alert.alert).toHaveBeenCalledWith("Error", "Please fill in all fields.");
  expect(navigation.replace).not.toHaveBeenCalled();
});

test("log in moves to the main screen once the email and password are filled in", async () => {
  const navigation = fakeNavigation();
  await open(<Login navigation={navigation} />);

  await fireEvent.changeText(screen.getByPlaceholderText("Email"), "kayleb@example.com");
  await fireEvent.changeText(screen.getByPlaceholderText("Password"), "Sprout#2026");
  await fireEvent.press(screen.getByText("Sign In"));

  expect(login).toHaveBeenLastCalledWith("kayleb@example.com", "Sprout#2026");
  expect(navigation.replace).toHaveBeenCalledWith("Main");
});

test("log in shows the reason from the backend when the password is wrong", async () => {
  const navigation = fakeNavigation();
  login.mockRejectedValueOnce(new Error("Email or password is incorrect."));
  await open(<Login navigation={navigation} />);

  await fireEvent.changeText(screen.getByPlaceholderText("Email"), "kayleb@example.com");
  await fireEvent.changeText(screen.getByPlaceholderText("Password"), "wrong");
  await fireEvent.press(screen.getByText("Sign In"));

  expect(Alert.alert).toHaveBeenLastCalledWith("Could not sign in", "Email or password is incorrect.");
  expect(navigation.replace).not.toHaveBeenCalled(); // still on the log in screen
});

test("log in has a link to create an account", async () => {
  const navigation = fakeNavigation();
  await open(<Login navigation={navigation} />);

  await fireEvent.press(screen.getByText("Create an account"));

  expect(navigation.navigate).toHaveBeenCalledWith("Signup");
});

// ---- CREATE ACCOUNT ----
// fills in step 1 of the sign up screen
async function fillSignup(username, email, password) {
  await fireEvent.changeText(screen.getByPlaceholderText("Username"), username);
  await fireEvent.changeText(screen.getByPlaceholderText("Email"), email);
  await fireEvent.changeText(screen.getByPlaceholderText("Password"), password);
  await fireEvent.press(screen.getByText("Continue"));
}

test("sign up turns down a bad email and a weak password", async () => {
  await open(<Signup navigation={fakeNavigation()} />);

  await fillSignup("kayleb", "not-an-email", "Sprout#2026");
  expect(Alert.alert).toHaveBeenLastCalledWith("Error", "That does not look like an email address.");

  await fillSignup("kayleb", "kayleb@example.com", "password");
  expect(Alert.alert).toHaveBeenLastCalledWith("Error", "Your password does not meet all of the rules yet.");

  // still on step 1
  expect(screen.getByText("Create your account")).toBeTruthy();
});

test("sign up goes through all three steps and ends on the main screen", async () => {
  const navigation = fakeNavigation();
  await open(<Signup navigation={navigation} />);

  // step 1, account details
  await fillSignup("kayleb", "kayleb@example.com", "Sprout#2026");
  expect(createAccount).toHaveBeenLastCalledWith("kayleb", "kayleb@example.com", "Sprout#2026");
  expect(screen.getByText("Check your email")).toBeTruthy();

  // step 2, a code that is too short is turned down, 6 digits moves on
  await fireEvent.changeText(screen.getByPlaceholderText("······"), "123");
  await fireEvent.press(screen.getByText("Verify"));
  expect(Alert.alert).toHaveBeenLastCalledWith("Error", "Enter the 6 digit code from your email.");

  await fireEvent.changeText(screen.getByPlaceholderText("······"), "123456");
  await fireEvent.press(screen.getByText("Verify"));
  expect(screen.getByText("Link your bank")).toBeTruthy();

  // step 3, skipping the bank goes straight to the main screen
  await fireEvent.press(screen.getByText("Skip for now"));
  expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Main" }] });
});

test("sign up stays on step 1 when the email is already taken", async () => {
  createAccount.mockRejectedValueOnce(new Error("That email or username is already in use."));
  await open(<Signup navigation={fakeNavigation()} />);

  await fillSignup("kayleb", "kayleb@example.com", "Sprout#2026");

  expect(Alert.alert).toHaveBeenLastCalledWith("Could not create account", "That email or username is already in use.");
  expect(screen.getByText("Create your account")).toBeTruthy();
});

// ---- HOME ----
test("home shows the five totals and each card opens its screen", async () => {
  const navigation = fakeNavigation();
  await open(<Home navigation={navigation} />);

  for (const amount of ["$1,284.50", "$3,420.00", "$18,640.12", "$14,275.00", "$1,450.00"]) {
    expect(screen.getByText(amount)).toBeTruthy();
  }

  const cards = [
    ["Monthly Spending", "Spending"],
    ["Monthly Income", "Income"],
    ["Total Savings", "Savings"],
    ["Debt Breakdown", "Debt"],
    ["Bills", "Bills"],
  ];
  for (const [label, screenName] of cards) {
    await fireEvent.press(screen.getByText(label));
    expect(navigation.navigate).toHaveBeenLastCalledWith(screenName);
  }
});

// ---- MAIN (the bottom tabs) ----
test("the bottom tabs switch between home, assistant and settings", async () => {
  await open(<Main navigation={fakeNavigation()} />);
  expect(screen.getByText("Total Savings")).toBeTruthy(); // starts on home

  await fireEvent.press(screen.getByText("Assistant"));
  expect(screen.getByPlaceholderText("Ask about your finances")).toBeTruthy();

  await fireEvent.press(screen.getByText("Settings"));
  expect(screen.getByText("Hide account values")).toBeTruthy();
});

test("turning on hide account values masks the amounts on the home tab", async () => {
  await open(<Main navigation={fakeNavigation()} />);

  await fireEvent.press(screen.getByText("Settings"));
  await fireEvent(screen.getByTestId("hide-values-switch"), "valueChange", true);
  await fireEvent.press(screen.getByText("Home"));

  expect(screen.queryByText("$18,640.12")).toBeNull();
  expect(screen.getAllByText("••••").length).toBeGreaterThan(0);
});

// ---- SPENDING ----
test("tapping a day on the spending calendar lists that day's purchases", async () => {
  await open(<Spending />);
  expect(screen.getByText("Tap a day to see its purchases")).toBeTruthy();

  await fireEvent.press(screen.getByText("13"));
  expect(screen.getByText("November 13 · $265.00")).toBeTruthy();
  expect(screen.getByText("$145.75")).toBeTruthy();

  // a day with nothing spent
  await fireEvent.press(screen.getByText("20"));
  expect(screen.getByText("No purchases on this day.")).toBeTruthy();
});

test("the add spending form checks the date and then adds to the total", async () => {
  await open(<Spending />);
  await fireEvent.press(screen.getByText("+ Add Spending"));

  // february 30th is not a real date
  await fireEvent.changeText(screen.getByPlaceholderText("Amount"), "10");
  await fireEvent.changeText(screen.getByPlaceholderText("Date (MM/DD/YYYY)"), "02/30/2026");
  await fireEvent.press(screen.getByText("Save"));
  expect(Alert.alert).toHaveBeenLastCalledWith("Error", "Enter the date like this: Date (MM/DD/YYYY)");
  expect(screen.getByText("$1,284.50")).toBeTruthy(); // total has not moved

  await fireEvent.changeText(screen.getByPlaceholderText("Date (MM/DD/YYYY)"), "11/16/2026");
  await fireEvent.changeText(screen.getByPlaceholderText("Description"), "Coffee");
  await fireEvent.press(screen.getByText("Save"));
  expect(screen.getByText("$1,294.50")).toBeTruthy(); // $10 more than before
  expect(screen.queryByPlaceholderText("Amount")).toBeNull(); // the form closed
});

// ---- INCOME ----
test("income shows the weekly breakdown and the net income after bills", async () => {
  await open(<Income />);

  expect(screen.getByText("5 deposits across 3 weeks")).toBeTruthy();
  expect(screen.getByText("$1,650.00")).toBeTruthy(); // week 3
  expect(screen.getByText("$1,970.00")).toBeTruthy(); // 3,420 income minus 1,450 bills
});

test("the add income form adds a deposit to the total", async () => {
  await open(<Income />);
  await fireEvent.press(screen.getByText("+ Add Income"));

  await fireEvent.changeText(screen.getByPlaceholderText("Amount"), "80");
  await fireEvent.changeText(screen.getByPlaceholderText("Date (MM/DD/YYYY)"), "11/23/2026");
  await fireEvent.press(screen.getByText("Save"));

  expect(screen.getByText("6 deposits across 4 weeks")).toBeTruthy();
  expect(screen.getAllByText("$3,500.00").length).toBeGreaterThan(0);
});

// ---- SAVINGS ----
test("tapping an investment account opens its holdings", async () => {
  await open(<Savings />);
  expect(screen.queryByText(/FXAIX/)).toBeNull();

  await fireEvent.press(screen.getByText("Retirement"));
  expect(screen.getByText("FXAIX · 20 shares × $195.00")).toBeTruthy();

  // tapping it again closes it
  await fireEvent.press(screen.getByText("Retirement"));
  expect(screen.queryByText(/FXAIX/)).toBeNull();
});

test("the add account form adds to the savings total", async () => {
  await open(<Savings />);
  await fireEvent.press(screen.getByText("+ Add Account"));

  await fireEvent.changeText(screen.getByPlaceholderText("Account name"), "Emergency fund");
  await fireEvent.changeText(screen.getByPlaceholderText("Balance"), "100");
  await fireEvent.press(screen.getByText("Save"));

  expect(screen.getByText("$18,740.12")).toBeTruthy();
  expect(screen.getByText("7 accounts · checking is not counted")).toBeTruthy();
});

// ---- DEBT ----
test("tapping a day on the payment calendar says what is due", async () => {
  await open(<Debt />);

  await fireEvent.press(screen.getByText("22"));
  expect(screen.getByText("Credit Card · minimum $65.00 due November 22")).toBeTruthy();

  await fireEvent.press(screen.getByText("10"));
  expect(screen.getByText("Nothing due on November 10.")).toBeTruthy();
});

test("the add debt form needs a name and balance, then adds to the total", async () => {
  await open(<Debt />);
  await fireEvent.press(screen.getByText("+ Add Debt"));

  await fireEvent.press(screen.getByText("Save"));
  expect(Alert.alert).toHaveBeenLastCalledWith("Error", "Enter a name and a balance for the debt.");

  await fireEvent.changeText(screen.getByPlaceholderText("Name"), "Medical");
  await fireEvent.changeText(screen.getByPlaceholderText("Balance"), "725");
  await fireEvent.changeText(screen.getByPlaceholderText("Due date (MM/DD/YYYY)"), "11/30/2026");
  await fireEvent.press(screen.getByText("Save"));

  expect(screen.getByText("$15,000.00")).toBeTruthy();
});

// ---- BILLS ----
test("tapping a day on the bills calendar only lists the bills due that day", async () => {
  await open(<Bills />);
  expect(screen.getByText("All bills")).toBeTruthy();
  expect(screen.getByText("Rent")).toBeTruthy();

  await fireEvent.press(screen.getByText("18"));
  expect(screen.getByText("Due November 18")).toBeTruthy();
  expect(screen.getAllByText("Car Payment").length).toBeGreaterThan(0);
  expect(screen.queryByText("Rent")).toBeNull();
});

test("the add bill form adds an upcoming bill to the total", async () => {
  await open(<Bills />);
  await fireEvent.press(screen.getByText("+ Add Bill"));

  await fireEvent.changeText(screen.getByPlaceholderText("Bill name"), "Water");
  await fireEvent.changeText(screen.getByPlaceholderText("Amount"), "50");
  await fireEvent.changeText(screen.getByPlaceholderText("Date (MM/DD/YYYY)"), "11/29/2026");
  await fireEvent.press(screen.getByText("Save"));

  expect(screen.getByText("$1,500.00")).toBeTruthy();
  expect(screen.getByText("Water")).toBeTruthy();
  expect(screen.getByText("$965.00 paid · $535.00 still to go")).toBeTruthy();
});

// ---- ASSISTANT ----
test("tapping a suggested question gets its answer, and clear wipes the chat", async () => {
  await open(<Assistant />);

  await fireEvent.press(screen.getByText("Can I afford my bills?"));
  await waitASecond();
  expect(screen.getByText(/You still have \$485.00 of bills left to pay/)).toBeTruthy();

  await fireEvent.press(screen.getByText("Clear"));
  expect(screen.queryByText(/You still have \$485.00/)).toBeNull();
});

test("typing a question that is not a suggested one gets the fallback answer", async () => {
  await open(<Assistant />);

  await fireEvent.changeText(screen.getByPlaceholderText("Ask about your finances"), "What is a Roth IRA?");
  await fireEvent(screen.getByPlaceholderText("Ask about your finances"), "submitEditing");

  expect(screen.getByText("What is a Roth IRA?")).toBeTruthy();
  await waitASecond();
  expect(screen.getByText(/For now I only know the suggested questions/)).toBeTruthy();
});

// ---- SETTINGS ----
test("changing the date order rewrites the dates", async () => {
  await open(<Settings navigation={fakeNavigation()} />);
  expect(screen.getByText("5 accounts · linked 11/02/2026")).toBeTruthy();

  await fireEvent.press(screen.getByText("DD/MM/YYYY"));
  expect(screen.getByText("5 accounts · linked 02/11/2026")).toBeTruthy();
});

test("disconnecting a bank asks first and then takes it off the list", async () => {
  await open(<Settings navigation={fakeNavigation()} />);

  await fireEvent.press(screen.getAllByText("Disconnect")[0]);
  expect(Alert.alert).toHaveBeenCalled();
  expect(screen.getByText("First Platypus Bank")).toBeTruthy(); // nothing is removed until it is confirmed

  // press the red "Disconnect" button inside the alert
  const buttons = Alert.alert.mock.calls[0][2];
  const confirm = buttons.find((button) => button.style === "destructive");
  await act(async () => confirm.onPress());
  expect(screen.queryByText("First Platypus Bank")).toBeNull();
  expect(screen.getByText("Platypus Investments")).toBeTruthy(); // the other bank is still there
});

test("connecting a new account adds a bank to the list", async () => {
  await open(<Settings navigation={fakeNavigation()} />);

  await fireEvent.press(screen.getByText("+ Connect a new account"));

  expect(screen.getByText("Plaid Sandbox Bank")).toBeTruthy();
  expect(screen.getByText(/^3 accounts · linked/)).toBeTruthy(); // the three accounts the stand in handed back
  expect(Alert.alert).toHaveBeenLastCalledWith("Linked", "Sandbox account connected.");
});

test("log out goes back to the log in screen", async () => {
  const navigation = fakeNavigation();
  await open(<Settings navigation={navigation} />);

  await fireEvent.press(screen.getByText("Log Out"));

  expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
});
