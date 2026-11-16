// File: validate.test.js
// Tests for the email and password checks in utils/validate.js

import assert from "node:assert/strict";

import { isValidEmail, passwordRules, isStrongPassword } from "../utils/validate.js";

test("isValidEmail accepts normal email addresses", () => {
  assert.equal(isValidEmail("kayleb@example.com"), true);
  assert.equal(isValidEmail("  first.last@school.edu  "), true); // spaces around it are ignored
});

test("isValidEmail turns down things that are not emails", () => {
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("kayleb"), false);
  assert.equal(isValidEmail("kayleb@example"), false); // no .com part
  assert.equal(isValidEmail("@example.com"), false);
  assert.equal(isValidEmail("kay leb@example.com"), false);
});

test("a strong password passes every rule", () => {
  assert.equal(isStrongPassword("Sprout#2026"), true);
  assert.deepEqual(passwordRules("Sprout#2026").map((rule) => rule.ok), [true, true, true]);
});

test("each password rule fails on its own", () => {
  assert.equal(isStrongPassword("Sp#1"), false); // too short
  assert.equal(isStrongPassword("sprout#2026"), false); // no uppercase
  assert.equal(isStrongPassword("SPROUT#2026"), false); // no lowercase
  assert.equal(isStrongPassword("Sprout#abcd"), false); // no number
  assert.equal(isStrongPassword("Sprout2026"), false); // no special character
  assert.equal(isStrongPassword(""), false);
});
