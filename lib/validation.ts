export const PURPOSES = [
  "Tithes & Offerings", "General Offering", "Building Fund", "Missions & Outreach",
  "Children's Ministry", "Prison Ministry", "Other",
] as const;

export class InputError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("Invalid request body");
  return value as Record<string, unknown>;
}

export function textField(value: unknown, label: string, max: number, required = true): string {
  if (value === undefined && !required) return "";
  if (typeof value !== "string") throw new InputError(`Invalid ${label}`);
  const result = value.trim();
  if ((required && !result) || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)) {
    throw new InputError(`Invalid ${label}`);
  }
  return result;
}

export function emailField(value: unknown): string {
  const email = textField(value, "email", 254);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new InputError("Invalid email");
  return email;
}

export function validateDonation(value: unknown) {
  const body = record(value);
  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount < 1 || body.amount > 500000) {
    throw new InputError("Amount must be between ₹1 and ₹5,00,000");
  }
  const amount = Math.round(body.amount * 100);
  if (Math.abs(body.amount * 100 - amount) > 0.000001) throw new InputError("Use at most two decimal places");
  const purpose = textField(body.purpose, "purpose", 100);
  if (!PURPOSES.some((item) => item === purpose)) throw new InputError("Invalid purpose");
  const name = textField(body.name, "name", 100);
  if (/[\r\n]/.test(name)) throw new InputError("Invalid name");
  return { amount, purpose, name, email: emailField(body.email) };
}

export function validateContact(value: unknown) {
  const body = record(value);
  const name = textField(body.name, "name", 100);
  if (/[\r\n]/.test(name)) throw new InputError("Invalid name");
  const type = textField(body.type, "request type", 30);
  if (!["general", "prayer", "visit", "counselling", "other"].includes(type)) throw new InputError("Invalid request type");
  const phone = textField(body.phone, "phone", 30, false);
  if (phone && !/^[+\d\s().-]{5,30}$/.test(phone)) throw new InputError("Invalid phone");
  return { name, email: emailField(body.email), phone, type, message: textField(body.message, "message", 5000) };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
