import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendDonationConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purpose,
      name,
      email,
      amount,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      purpose: string;
      name: string;
      email: string;
      amount: number;
    };

    // Verify signature
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Send confirmation email
    await sendDonationConfirmation({
      to: email,
      donorName: name,
      amount,
      currency: "INR",
      purpose,
      reference: razorpay_payment_id,
      gateway: "razorpay",
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
