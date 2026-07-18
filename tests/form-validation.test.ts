import assert from "node:assert/strict";
import test from "node:test";
import {
    isValidDateOnly,
    isValidEmail,
    isValidMoneyAmount,
    isValidSignatureImage,
    normalizeEmail,
} from "../lib/form-validation";

test("normalizes and validates email addresses", () => {
    assert.equal(normalizeEmail("  User@Example.COM "), "user@example.com");
    assert.equal(isValidEmail("user@example.com"), true);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail(`${"a".repeat(250)}@x.test`), false);
});

test("accepts exact two-decimal money values without float parsing", () => {
    assert.equal(isValidMoneyAmount("99"), true);
    assert.equal(isValidMoneyAmount("99.90"), true);
    assert.equal(isValidMoneyAmount("0.01"), true);
    assert.equal(isValidMoneyAmount("0"), false);
    assert.equal(isValidMoneyAmount("1.001"), false);
    assert.equal(isValidMoneyAmount("1000000000"), false);
});

test("rejects normalized or impossible calendar dates", () => {
    assert.equal(isValidDateOnly("2028-02-29"), true);
    assert.equal(isValidDateOnly("2027-02-29"), false);
    assert.equal(isValidDateOnly("2026-13-01"), false);
});

test("only accepts supported base64 signature image formats", () => {
    assert.equal(isValidSignatureImage(""), true);
    assert.equal(isValidSignatureImage("data:image/png;base64,aGVsbG8="), true);
    assert.equal(isValidSignatureImage("data:image/svg+xml;base64,PHN2Zz4="), false);
    assert.equal(isValidSignatureImage("data:image/png,not-base64"), false);
});
