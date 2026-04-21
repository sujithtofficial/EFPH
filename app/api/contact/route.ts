import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, type } = body as {
      name: string; email: string; phone?: string; message: string; type: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Basic email sanity check (prevent header injection)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Notify church staff
    await resend.emails.send({
      from: "EFPH Website <noreply@ebenezerministries.in>",
      to: "info@ebenezerministries.in",
      replyTo: email,
      subject: `[${type.toUpperCase()}] New message from ${name}`,
      html: `
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <hr/>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Auto-reply to sender
    await resend.emails.send({
      from: "Ebenezer Faith Prayer House <noreply@ebenezerministries.in>",
      to: email,
      subject: "We received your message — EFPH",
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to Ebenezer Faith Prayer House. We have received your message and our team will get back to you shortly.</p>
        ${type === "prayer" ? "<p>Please know that our intercessors are praying for you.</p>" : ""}
        <p>Blessings,<br/>EFPH Church Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
