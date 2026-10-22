import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { escapeHtml, validateContact, validateDonation, InputError } from "../lib/validation";
import { assertCapturedPayment, validPaymentSignature } from "../lib/payment-security";
import { checkRateLimit, readSubmission } from "../lib/http";
import { POST as createOrder } from "../app/api/razorpay/route";
import { POST as contact } from "../app/api/contact/route";

const gift = { amount: 123.45, name: "Test Donor", email: "test@example.com", purpose: "General Offering" };
const message = { name: "Test Visitor", email: "test@example.com", message: "Please pray for us.", type: "prayer", phone: "" };
const request = (body: unknown, headers = {}) => new Request("https://church.example/api/test", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });

test("donations are converted to exact integer paise", () => {
  assert.equal(validateDonation(gift).amount, 12345);
  assert.equal(validateDonation({ ...gift, amount: 1.01 }).amount, 101);
});
for (const amount of [0, -1, NaN, Infinity, "100", null, {}, 500001, 1.001]) {
  test(`rejects invalid or excessive donation amount ${String(amount)}`, () => assert.throws(() => validateDonation({ ...gift, amount }), InputError));
}
test("rejects invalid donor details and unrecognised purposes", () => {
  for (const changes of [{ purpose: "<script>" }, { email: "a@example.com\r\nBcc:evil@example.com" }, { name: "a\nb" }, { name: [] }]) {
    assert.throws(() => validateDonation({ ...gift, ...changes }), InputError);
  }
});
test("contact validates types, email, phone and bounds", () => {
  assert.equal(validateContact(message).type, "prayer");
  for (const changes of [{ name: {} }, { type: "ADMIN" }, { email: "bad" }, { message: "x".repeat(5001) }, { phone: "<script>" }]) {
    assert.throws(() => validateContact({ ...message, ...changes }), InputError);
  }
});
test("email HTML escapes user markup and attribute characters", () => {
  assert.equal(escapeHtml('<a href="evil">A&B\'</a>'), "&lt;a href=&quot;evil&quot;&gt;A&amp;B&#39;&lt;/a&gt;");
});
test("only a correct signature for the signed order and payment is accepted", () => {
  const signature = createHmac("sha256", "test-secret").update("order_123|pay_456").digest("hex");
  assert.equal(validPaymentSignature("order_123", "pay_456", signature, "test-secret"), true);
  assert.equal(validPaymentSignature("order_999", "pay_456", signature, "test-secret"), false);
  assert.equal(validPaymentSignature("order_123", "pay_999", signature, "test-secret"), false);
  assert.equal(validPaymentSignature("order_123", "pay_456", "a", "test-secret"), false);
  assert.equal(validPaymentSignature("order_123", "pay_456", "z".repeat(64), "test-secret"), false);
});
test("only a matching captured INR payment on a paid order can issue a receipt", () => {
  const order = { id: "order_123", amount: 12345, amount_paid: 12345, currency: "INR", status: "paid" };
  const payment = { order_id: "order_123", amount: 12345, currency: "INR", status: "captured", captured: true };
  assert.doesNotThrow(() => assertCapturedPayment(order, payment));
  for (const changes of [{ order_id: "order_wrong" }, { amount: 1 }, { currency: "USD" }, { status: "authorized" }, { captured: false }]) {
    assert.throws(() => assertCapturedPayment(order, { ...payment, ...changes }), InputError);
  }
  assert.throws(() => assertCapturedPayment({ ...order, amount_paid: 0 }, payment), InputError);
});
test("submissions reject cross-site requests and non-JSON content", async () => {
  await assert.rejects(readSubmission(request({}, { Origin: "https://evil.example" }), "origin-test", 5), (error: unknown) => error instanceof InputError && error.status === 403);
  await assert.rejects(readSubmission(request({}, { "Sec-Fetch-Site": "cross-site" }), "fetch-test", 5), InputError);
  await assert.rejects(readSubmission(request({}, { "Content-Type": "text/plain" }), "json-test", 5), (error: unknown) => error instanceof InputError && error.status === 415);
});
test("submissions reject malformed JSON, arrays and oversized bodies", async () => {
  await assert.rejects(readSubmission(new Request("https://church.example", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }), "malformed-test", 5), InputError);
  await assert.rejects(readSubmission(request([]), "array-test", 5), InputError);
  await assert.rejects(readSubmission(request({ text: "x".repeat(17000) }), "size-test", 5), (error: unknown) => error instanceof InputError && error.status === 413);
  assert.deepEqual(await readSubmission(request({ okay: true }, { Origin: "https://church.example" }), "valid-test", 5), { okay: true });
});
test("rate limits reset after their window", () => {
  checkRateLimit("limit-test", 1, 1000);
  assert.throws(() => checkRateLimit("limit-test", 1, 1001), (error: unknown) => error instanceof InputError && error.status === 429);
  assert.doesNotThrow(() => checkRateLimit("limit-test", 1, 601001));
});
test("order endpoint rejects invalid input before reaching the gateway", async () => {
  const response = await createOrder(request({ ...gift, amount: -10 }));
  assert.equal(response.status, 400);
});
test("contact endpoint rejects invalid fields before sending email", async () => {
  const response = await contact(request({ ...message, type: {} }));
  assert.equal(response.status, 400);
});

test("webhooks authenticate the exact raw body and reject tampering", async () => {
  const { validWebhookSignature } = await import("../lib/payment-security");
  const body = '{"event":"payment.captured"}';
  const signature = createHmac("sha256", "webhook-secret").update(body).digest("hex");
  assert.equal(validWebhookSignature(body, signature, "webhook-secret"), true);
  assert.equal(validWebhookSignature(body + " ", signature, "webhook-secret"), false);
  assert.equal(validWebhookSignature(body, signature, "wrong-secret"), false);
  assert.equal(validWebhookSignature(body, "", "webhook-secret"), false);
});
