import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, purpose, name, email } = body as {
      amount: number; purpose: string; name: string; email: string;
    };

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100), // cents
            product_data: {
              name: `EFPH Offering — ${purpose}`,
              description: "Ebenezer Faith Prayer House — Thank you for your generosity!",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { purpose, donorName: name, donorEmail: email },
      success_url: `${origin}/give/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/give`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 });
  }
}
