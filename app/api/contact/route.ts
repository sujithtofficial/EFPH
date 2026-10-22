import { Resend } from "resend";
import { CHURCH } from "@/lib/church";
import { apiError, readSubmission } from "@/lib/http";
import { escapeHtml, InputError, validateContact } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await readSubmission(req, "contact", 5);
    if (body.website) return Response.json({ success: true });
    const { name, email, phone, message, type } = validateContact(body);
    if (!process.env.RESEND_API_KEY) throw new InputError("Please email or call us directly while the form is unavailable.", 503);
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: "EFPH Website <noreply@ebenezerministries.in>",
      to: CHURCH.email, replyTo: email,
      subject: `[${type.toUpperCase()}] New message from ${name}`,
      html: `<p><strong>Type:</strong> ${escapeHtml(type)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
        <hr/><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });
    if (result.error) throw new Error("Contact delivery failed");
    // Staff delivery succeeded. Auto-reply failure must not cause resubmission.
    try {
      await resend.emails.send({
        from: "Ebenezer Faith Prayer House <noreply@ebenezerministries.in>",
        to: email, subject: "We received your message — EFPH",
        html: `<p>Dear ${escapeHtml(name)},</p>
          <p>Thank you for reaching out to Ebenezer Faith Prayer House. We have received your message and our team will get back to you shortly.</p>
          ${type === "prayer" ? "<p>Please know that our intercessors are praying for you.</p>" : ""}
          <p>Blessings,<br/>EFPH Church Team</p>`,
      });
    } catch { console.error("Contact auto-reply unavailable"); }
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "Failed to send message. Please email or call us directly."); }
}
