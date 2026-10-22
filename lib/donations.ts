import { getRazorpay } from "./razorpay";
import { assertCapturedPayment } from "./payment-security";
import { validateDonation } from "./validation";
import { sendDonationConfirmation } from "./email";

export async function confirmDonation(orderId: string, paymentId: string) {
  const gateway = getRazorpay();
  const [order, payment] = await Promise.all([gateway.orders.fetch(orderId), gateway.payments.fetch(paymentId)]);
  assertCapturedPayment(order, payment);
  const donation = validateDonation({ amount: Number(order.amount) / 100, name: order.notes?.donorName, email: order.notes?.donorEmail, purpose: order.notes?.purpose });
  try {
    return await sendDonationConfirmation({ to: donation.email, donorName: donation.name, amount: donation.amount / 100, purpose: donation.purpose, reference: paymentId });
  } catch { console.error("Donation receipt delivery unavailable"); return false; }
}
