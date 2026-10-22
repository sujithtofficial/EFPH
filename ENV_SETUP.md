# Production setup

Use Node.js 24.x. Copy `.env.example` to `.env.local` for local development, and add production values to the existing Vercel project. Never commit credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical production origin. Defaults to the supplied live site, `https://project-njo3j.vercel.app`. Set to a custom domain only after it is connected and serving this application. |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID. The order endpoint supplies the matching public ID to Checkout. |
| `RAZORPAY_KEY_SECRET` | Server-only API secret used for order creation, authenticated gateway lookups, and payment signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Separate webhook signing secret. |
| `RESEND_API_KEY` | Server-only email key. Verify the sending domain `ebenezerministries.in` in Resend. |
| `YOUTUBE_TAMIL_KANNADA_PLAYLIST_ID` | Optional dedicated Tamil/Kannada playlist ID. |
| `YOUTUBE_ENGLISH_HINDI_PLAYLIST_ID` | Optional dedicated English/Hindi playlist ID. |

## Indian payments

Only INR payments through Razorpay are supported. Stripe code, endpoints, packages, and environment variables have been removed. No public Razorpay environment variable is required.

1. Enable the intended domestic UPI, card, and net banking methods in the Razorpay dashboard. If the account has international card acceptance enabled, disable that account-level setting to enforce domestic acceptance. An INR-only website does not itself restrict the issuer country of a card.
2. Enable automatic payment capture. Receipts and the success response require a captured INR payment, a paid order, and matching gateway amounts and order IDs.
3. Configure a webhook at `https://<production-host>/api/razorpay/webhook`, subscribe to `payment.captured`, and set its signing secret in Vercel as `RAZORPAY_WEBHOOK_SECRET`.
4. Confirm the Resend sending domain. Browser verification and webhook delivery use the same payment-specific Resend idempotency key (24-hour retention). Webhooks allow email delivery to recover if a donor closes the browser. Use durable payment-event storage if permanent deduplication or an accounting ledger is needed.
5. Exercise a Razorpay **test-mode** success, failure, cancellation, interrupted confirmation, and signed webhook before switching to live keys. Do not test with actual donations.

Missing gateway configuration returns 503 with a contact/in-person fallback. Receipt email failure does not report a captured payment as failed; the confirmation page accurately reports whether email was sent. Webhook email failures return 503 for provider retry.

## Contact form and abuse protection

Verify `RESEND_API_KEY` and the sender domain. Staff delivery errors produce a failure response; an optional auto-reply failure does not ask the visitor to duplicate a delivered message.

Input types and lengths, email format, request origin, JSON content type, and body size are checked. All user values in email HTML are escaped. A hidden honeypot and bounded per-instance rate limits provide basic protection. Configure Vercel Firewall rate-limit rules for `/api/contact`, `/api/razorpay`, and `/api/razorpay/verify` for enforcement across instances. Exempt the signed webhook from browser challenge rules.

The server trusts Vercel's `x-vercel-forwarded-for` header only when running on Vercel. Other hosting platforms need their own trusted proxy configuration and shared rate limiter.

## Video services

No YouTube API key is needed or shipped to browsers. The server caches the church's public Atom feed for five minutes and finds each language's newest matching `Sunday Service` title. The player is loaded only when a visitor presses Play. The actual video's title is preserved; the page does not infer a live broadcast merely because it is Sunday or because a recording's title contains “LIVE”.

The feed contains a limited recent window. Dedicated language playlists are recommended if Sunday recordings might fall out of that window during busy events. If no matching recording is present or YouTube is unavailable, that service retains its own YouTube search link; it never silently plays the other language.

## SEO and headers

Every public page has a title, description, canonical URL and social metadata. `/sitemap.xml` and `/robots.txt` use the configured canonical origin. Vercel previews are marked noindex. The thank-you page is noindex and omitted from the sitemap. The church schema uses existing public church details.

The Content Security Policy restricts frame and network origins to the app, YouTube, Maps and Razorpay. Static Next.js hydration requires inline scripts under this policy; a nonce-based policy would require dynamic rendering or a different build strategy. Production does not allow `unsafe-eval`. Confirm Checkout and Maps after any provider-origin changes.
