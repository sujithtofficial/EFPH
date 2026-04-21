import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, purpose, name, email } = body as {
      amount: number; purpose: string; name: string; email: string;
    };

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { purpose, donorName: name, donorEmail: email },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (err: unknown) {
    console.error("Razorpay order error:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
