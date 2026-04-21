# Environment Variables Setup Guide

Copy `.env.local.example` or create `.env.local` in the project root with the variables below.

---

## 1. Razorpay (Indian Payments — ₹)

| Variable | Example |
|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_xxxxx` / `rzp_live_xxxxx` |
| `RAZORPAY_KEY_SECRET` | `xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` |
| `RAZORPAY_WEBHOOK_SECRET` | `xxxxxxxxxxxxxxxx` |

### How to get:
1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) and sign up / log in.
2. Navigate to **Settings → API Keys → Generate Key**.
3. Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`) and **Key Secret**.
4. For webhooks: go to **Settings → Webhooks → Add New Webhook**.
   - URL: `https://yourdomain.com/api/donations/razorpay`
   - Events: `payment.captured`
   - Copy the **Webhook Secret**.

> Use `rzp_test_` keys for development. Switch to `rzp_live_` for production.

---

## 2. Stripe (International Payments — $)

| Variable | Example |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_xxxxx` / `sk_live_xxxxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxx` / `pk_live_xxxxx` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` |

### How to get:
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and sign up / log in.
2. Navigate to **Developers → API keys**.
3. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`).
4. For webhooks: go to **Developers → Webhooks → Add endpoint**.
   - URL: `https://yourdomain.com/api/donations/stripe`
   - Events: `checkout.session.completed`
   - Copy the **Signing secret** (`whsec_...`).

> For local testing, install Stripe CLI:
> ```bash
> brew install stripe/stripe-cli/stripe
> stripe login
> stripe listen --forward-to localhost:3000/api/donations/stripe
> ```
> The CLI will print a `whsec_...` secret to use locally.

---

## 3. Resend (Transactional Emails)

| Variable | Example |
|---|---|
| `RESEND_API_KEY` | `re_xxxxx` |

### How to get:
1. Go to [https://resend.com](https://resend.com) and sign up / log in.
2. Navigate to **API Keys → Create API Key**.
3. Copy the key (starts with `re_`).
4. **Domain setup** (for production): Go to **Domains → Add Domain** and add DNS records as instructed. Until verified, emails send from `onboarding@resend.dev`.

---

## 4. YouTube Data API v3 (Live Stream & Videos)

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | `AIzaSy...` |

### How to get:
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (or select existing).
3. Navigate to **APIs & Services → Library** → search "YouTube Data API v3" → **Enable**.
4. Go to **APIs & Services → Credentials → Create Credentials → API Key**.
5. Copy the API key.
6. **Recommended**: Click the key → **Restrict key** → under "API restrictions", select "YouTube Data API v3" only.

---

## 5. App URLs

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) / `https://yourdomain.com` (prod) |
| `NEXT_PUBLIC_SITE_URL` | Same as above |

---

## 6. Sanity CMS (Optional — not actively used)

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `abcd1234` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |

Only needed if you enable the Sanity CMS integration later. Can be left as `placeholder` for now.

---

## Complete `.env.local` Template

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx

# Sanity (optional)
NEXT_PUBLIC_SANITY_PROJECT_ID=placeholder
NEXT_PUBLIC_SANITY_DATASET=production

# YouTube
NEXT_PUBLIC_YOUTUBE_API_KEY=placeholder

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
