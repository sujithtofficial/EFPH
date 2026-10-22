import { confirmDonation } from "@/lib/donations";
import { apiError, readLimitedText } from "@/lib/http";
import { validWebhookSignature } from "@/lib/payment-security";
import { InputError, record, textField } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new InputError("Webhook is not configured", 503);
    const raw = await readLimitedText(req);
    if (!validWebhookSignature(raw, req.headers.get("x-razorpay-signature") ?? "", secret)) throw new InputError("Invalid webhook signature");
    let event: Record<string, unknown>;
    try { event = record(JSON.parse(raw)); } catch { throw new InputError("Invalid webhook body"); }
    if (event.event !== "payment.captured") return Response.json({ received: true });
    const entity = record(record(record(event.payload).payment).entity);
    const paymentId = textField(entity.id, "payment ID", 100);
    const orderId = textField(entity.order_id, "order ID", 100);
    if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId) || !/^order_[a-zA-Z0-9]+$/.test(orderId)) throw new InputError("Invalid payment reference");
    const receiptSent = await confirmDonation(orderId, paymentId);
    // A failing email should be retried by the provider, using the same
    // idempotency key as browser verification to avoid duplicate receipts.
    if (!receiptSent) throw new InputError("Receipt delivery unavailable", 503);
    return Response.json({ received: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "Webhook processing failed"); }
}
