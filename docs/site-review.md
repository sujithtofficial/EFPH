# Site review and implementation

Reviewed 23 October 2026 (Asia/Kolkata), starting from `70dcc2f` on `main`.

## Design plan implemented

Preserve the church's text, imagery, navy/gold identity, service schedule, and ministry information. Use warm ivory surfaces, restrained serif display headings, consistent controls, generous spacing, and quieter borders. Prioritise the visitor's next step: watch the correct service, plan a visit, submit a prayer request, or give in INR.

The homepage now has a readable photographic hero, three evenly spaced service links, an editorial welcome/photo section, event information, the original testimonies, and the original prayer invitation. Internal pages share the typography and navigation. Background video and YouTube playback start only on request. Original church photographs remain in the repository.

## Findings and fixes

| Finding | Result |
| --- | --- |
| The live page had one generic player and incompatible 9:00/11:30 service times | Two explicit choices: Tamil & Kannada, Sunday 7:15 AM IST; English & Hindi, Sunday 11:00 AM IST. Each selects its own latest matching Sunday video from the church's feed. |
| Any Sunday was described as “Live Now”, based on the visitor's local date | Removed date-based live assertions. Actual video titles are preserved; the page shows the selected recording and a direct YouTube fallback. |
| International donation option and publicly callable Stripe endpoints | Removed Stripe UI, server routes, dependencies, and setup variables. Updated only the corresponding payment-provider references in policies. |
| Payment verification accepted browser-supplied amount, recipient and purpose | HMAC verification uses constant-time comparison. Receipt details come from the authenticated Razorpay order. Captured status, order identity, INR currency, paid amount and total are verified. |
| Checkout could reopen while payment was in progress; failed script loads could look successful | Typed, shared script-loading promise with timeout/retry; duplicate-submit guard; checkout remains busy; confirmation failure shows the payment reference and blocks an accidental second payment. |
| Email failure could report a successful payment as failed | Payment and email outcomes are separate. Receipt status is accurately reflected on the thank-you page. |
| Browser-only receipt delivery could be lost on closure | Signed, bounded-body `payment.captured` webhook handler with gateway lookup and shared Resend idempotency key. Provider configuration still required. |
| Contact and donation email HTML interpolated unescaped input | Escape user-provided HTML, validate types and bounded fields, validate purpose/type allowlists, reject malformed JSON and unsupported request content types. |
| Contact delivery ignored Resend's returned error object | Staff delivery checks the provider result. Auto-reply failure does not cause duplicate staff submissions. |
| No basic origin, size or abuse checks on public submission endpoints | Same-origin browser checks, JSON-only submission, 16 KiB body limit, honeypot, bounded per-instance rate limiting. Shared limits remain an infrastructure responsibility. |
| Missing security response headers | CSP, anti-framing, nosniff, HSTS, referrer policy and permissions policy; restrict external image optimisation to YouTube thumbnails. |
| Next.js 16.2.3 and its image runtime had critical advisories | Upgraded to Next.js 16.4.2 and React 19.3.1. Removed unused Sanity, Stripe, toast and animation packages. |
| Node 20 target and no committed dependency lock | Node 24 target, tracked npm lockfile, reproducible `npm ci` deployment, GitHub checks. |
| Most pages inherited the homepage's title and had no canonical URL | Per-route titles/descriptions/canonicals, Open Graph/Twitter image, church JSON-LD, sitemap, robots, church icons, preview noindex, thank-you noindex. |
| Static content relied on animation hydration and scroll effects | Homepage, About, Ministries and Events are server-rendered without the animation library. Font weights reduced. Media uses responsive image optimisation and explicit lazy/click loading. |
| Gallery overlay lacked Escape, focus management, and keyboard support | Dynamically loaded lightbox with next/previous, keyboard controls, modal focus handling, scroll lock, and retained album/counter caption. |
| Mobile menu lacked expansion state; forms/social links lacked labels | Explicit labels/current-page states, expanded menu state, Escape handling, skip link, labelled forms, status announcements, social names and larger targets. |
| Prayer and visit calls to action did not select the corresponding request type | Dedicated query links select the correct contact category. |
| Legal pages used typography classes without a typography plugin | Added explicit readable legal-document typography, paragraph spacing, lists and link styling. |

## Validation

- `npm run lint`: passed without warnings.
- `npm run typecheck`: passed.
- `npm test`: 24 passed, including payment/webhook integrity, validation, email escaping, submission limits, and language-selection regressions.
- Production build with Node 24.22.1: passed.
- `npm audit --omit=dev`: zero known vulnerabilities at review time.
- All 11 page routes checked: HTTP 200, one H1 each, route-specific canonical metadata. Removed Stripe endpoints: 404. Out-of-range YouTube query: 400.
- Browser checks at 390px mobile and 1440px desktop: no horizontal overflow in the checked routes, menu expansion/Escape works, both selected YouTube recordings play, prayer category preselects, the map loads, gallery filtering/navigation/Escape/focus restoration works, and Indian-only giving renders correctly.
- A source text-block comparison confirmed retained original text across Home, About, Ministries, Events and Contact. Giving/policy differences are the requested removal of the international provider. Live schedule/receipt corrections fix misleading operational text.

### Measured payload comparison

Fetched the original production homepage and revised production build, then totalled the JavaScript URLs directly referenced by their HTML. Gzip figures are local compression estimates, not browser transfer measurements or Core Web Vitals.

| Homepage payload | Original live site | Revised build |
| --- | ---: | ---: |
| Linked scripts | 12 | 9 |
| JavaScript, uncompressed | 839,307 bytes | 603,536 bytes |
| Estimated gzip JavaScript | 255,936 bytes | 187,510 bytes |
| HTML | 53,401 bytes | 70,531 bytes |

JavaScript is approximately 28% smaller uncompressed and 27% smaller by estimated gzip. HTML increases as more content is rendered on the server. The 8.3 MiB background video no longer starts downloading automatically, and the live page no longer loads a YouTube iframe before playback is requested. Lighthouse scores and field Web Vitals were not measured.

## Remaining deployment checks and limits

- Local credentials were not available. No real donation or email was sent. Exercise Razorpay test mode and Resend delivery using the existing account before enabling the updated flow in production.
- Configure the signed webhook, automatic capture, and sender-domain verification as described in `ENV_SETUP.md`. Existing keys remain server-side. The public Checkout key is returned with its matching order.
- Removing the international UI/provider does not change Razorpay account-level card acceptance. Disable international acceptance in the account if required.
- Per-instance rate limiting is best effort in serverless infrastructure. Add Vercel Firewall/shared rate limiting for deployment-wide abuse control.
- Resend deduplication lasts 24 hours. Permanent event deduplication or a financial ledger requires durable storage.
- Five **development-only** npm advisories remain in the Next ESLint plugin's `fast-glob` → `micromatch` → `braces` chain. The latest published `braces` was 3.0.3 and remained affected at review time. Production dependencies audit cleanly. Avoid automated forced downgrades of the framework; update the tooling chain when an upstream fix is published.
- The CSP permits inline scripts for static Next.js hydration. It still limits external scripts/frames/connections and forbids production eval. A nonce-only policy needs a different rendering/build strategy.
- The public YouTube feed has a finite recent window. Optional dedicated playlists provide stable long-term language archives if Sunday recordings leave that window. Missing feeds retain a language-specific external fallback.
