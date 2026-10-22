import { getRazorpay } from "@/lib/razorpay";
import { confirmDonation } from "@/lib/donations";
import { apiError, readSubmission } from "@/lib/http";
import { InputError, textField } from "@/lib/validation";
import { validPaymentSignature } from "@/lib/payment-security";

export async function POST(req: Request) {
  try {
    const body = await readSubmission(req, "verification", 20);
    const orderId = textField(body.razorpay_order_id, "order ID", 100);
    const paymentId = textField(body.razorpay_payment_id, "payment ID", 100);
    const signature = textField(body.razorpay_signature, "signature", 64);
    getRazorpay();
    if (!validPaymentSignature(orderId, paymentId, signature, process.env.RAZORPAY_KEY_SECRET!)) throw new InputError("Invalid payment signature");
    // Fetch captured payment and receipt details from the authenticated gateway.
    const receiptSent = await confirmDonation(orderId, paymentId);
    return Response.json({ success: true, receiptSent }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "Unable to confirm payment. Please contact us with your payment reference before trying again."); }
}
