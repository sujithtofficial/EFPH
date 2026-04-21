import { Resend } from "resend";
import { CHURCH } from "./church";

const resend = new Resend(process.env.RESEND_API_KEY!);

interface DonationEmailProps {
  to: string;
  donorName: string;
  amount: number;
  currency: "INR" | "USD";
  purpose: string;
  reference: string;
  gateway: "razorpay" | "stripe";
}

export async function sendDonationConfirmation({
  to,
  donorName,
  amount,
  currency,
  purpose,
  reference,
  gateway,
}: DonationEmailProps) {
  const formattedAmount =
    currency === "INR"
      ? `₹${amount.toLocaleString("en-IN")}`
      : `$${(amount / 100).toFixed(2)}`;

  await resend.emails.send({
    from:    `${CHURCH.shortName} <noreply@ebenezerministries.in>`,
    to:      [to],
    subject: `Thank you for your offering – ${CHURCH.shortName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:system-ui,sans-serif;background:#faf8f5;margin:0;padding:32px;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:#0f172a;padding:32px 40px;">
      <h1 style="color:#b0925e;margin:0;font-size:22px;">${CHURCH.name}</h1>
      <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">${CHURCH.tagline}</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#0f172a;font-size:18px;margin:0 0 8px;">Thank you, ${donorName || "Blessed Giver"}!</h2>
      <p style="color:#475569;margin:0 0 24px;">Your offering has been received. May God bless you abundantly for your faithfulness.</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Amount</td>
          <td style="padding:10px 0;color:#0f172a;font-weight:600;text-align:right;">${formattedAmount}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Purpose</td>
          <td style="padding:10px 0;color:#0f172a;text-align:right;">${purpose}</td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 0;color:#64748b;">Reference</td>
          <td style="padding:10px 0;color:#0f172a;font-family:monospace;text-align:right;">${reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b;">Payment Method</td>
          <td style="padding:10px 0;color:#0f172a;text-align:right;text-transform:capitalize;">${gateway}</td>
        </tr>
      </table>

      <div style="margin-top:32px;padding:20px;background:#f8f6f2;border-left:3px solid #b0925e;">
        <p style="margin:0;color:#0f172a;font-style:italic;font-size:14px;">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7</p>
      </div>

      <p style="margin:24px 0 0;color:#64748b;font-size:13px;">
        For any queries, contact us at
        <a href="mailto:${CHURCH.email}" style="color:#b0925e;">${CHURCH.email}</a>
        or call <a href="tel:${CHURCH.phone}" style="color:#b0925e;">${CHURCH.phone}</a>.
      </p>
    </div>
    <div style="background:#f1f5f9;padding:16px 40px;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">${CHURCH.address}</p>
    </div>
  </div>
</body>
</html>
    `,
  });
}
