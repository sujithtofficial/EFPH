export type PaymentResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type CheckoutOptions = { key: string; order_id: string; amount: number; currency: "INR"; name: string; description: string; prefill: { name: string; email: string }; theme: { color: string }; handler: (response: PaymentResponse) => Promise<void>; modal: { ondismiss: () => void } };
interface Checkout { open(): void; on(event: "payment.failed", callback: () => void): void }
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => Checkout } }
let pending: Promise<void> | undefined;
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 15000);
    const fail = () => { window.clearTimeout(timeout); script.remove(); pending = undefined; reject(new Error("Could not load payment gateway. Please try again.")); };
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { window.clearTimeout(timeout); if (window.Razorpay) resolve(); else fail(); };
    script.onerror = fail;
    document.body.appendChild(script);
  });
  return pending;
}
