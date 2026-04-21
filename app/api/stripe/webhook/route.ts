import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendDonationConfirmation } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const amountTotal = (session.amount_total ?? 0) / 100;

    if (meta.donorEmail) {
      await sendDonationConfirmation({
        to: meta.donorEmail,
        donorName: meta.donorName ?? "Donor",
        amount: amountTotal,
        currency: "USD",
        purpose: meta.purpose ?? "Offering",
        reference: session.payment_intent as string,
        gateway: "stripe",
      });
    }
  }

  return NextResponse.json({ received: true });
}
