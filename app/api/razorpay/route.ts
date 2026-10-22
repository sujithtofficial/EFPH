import { randomUUID } from "node:crypto";
import { getRazorpay } from "@/lib/razorpay";
import { apiError, readSubmission } from "@/lib/http";
import { validateDonation } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const donation = validateDonation(await readSubmission(req, "donation", 10));
    const order = await getRazorpay().orders.create({
      amount: donation.amount,
      currency: "INR",
      receipt: `gift_${randomUUID().replaceAll("-", "")}`,
      notes: { purpose: donation.purpose, donorName: donation.name, donorEmail: donation.email },
    });
    return Response.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "Unable to start payment. Please try again or contact us."); }
}
