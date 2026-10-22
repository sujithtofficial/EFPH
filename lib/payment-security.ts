import { createHmac, timingSafeEqual } from "node:crypto";
import { InputError } from "./validation";

export function validPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  if (!/^order_[a-zA-Z0-9]+$/.test(orderId) || !/^pay_[a-zA-Z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

type Payment = { order_id?: string | null; currency: string; amount: number | string; status: string; captured?: boolean };
type Order = { id: string; currency: string; amount: number | string; status: string; amount_paid: number | string };

export function assertCapturedPayment(order: Order, payment: Payment) {
  if (payment.order_id !== order.id || payment.currency !== "INR" || order.currency !== "INR" ||
      Number(payment.amount) !== Number(order.amount) || Number(order.amount_paid) !== Number(order.amount) ||
      order.status !== "paid" || payment.status !== "captured" || payment.captured !== true) {
    throw new InputError("Payment is not yet captured. Please contact us with your payment reference.", 409);
  }
}

export function validWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
