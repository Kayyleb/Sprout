// File: validate.js
// Small checks for what the user types on the log in and sign up screens, kept here so they can be tested on their own

// true when the text looks like an email address (something@something.something, no spaces)
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// the password rules from the proposal, each one knows if the password passes it
// the sign up screen shows these as a list and turns each one green once it is met
export function passwordRules(password) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "An uppercase and a lowercase letter", ok: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "A number and a special character", ok: /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) },
  ];
}

// true when the password passes every rule
export function isStrongPassword(password) {
  return passwordRules(password).every((rule) => rule.ok);
}
