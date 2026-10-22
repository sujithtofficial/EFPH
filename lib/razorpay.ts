import Razorpay from "razorpay";
import { InputError } from "./validation";

let _razorpay: Razorpay;
export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new InputError("Online giving is currently unavailable. Please contact us or give in person.", 503);
  }
  if (!_razorpay) _razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return _razorpay;
}
