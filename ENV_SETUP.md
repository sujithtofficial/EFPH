# Production setup

Use Node.js 24.x. Copy `.env.example` to `.env.local` for local development, and add production values to the existing Vercel project. Never commit credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical production origin. Defaults to the supplied live site, `https://project-njo3j.vercel.app`. Set to a custom domain only after it is connected and serving this application. |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID. The order endpoint supplies the matching public ID to Checkout. |
| `RAZORPAY_KEY_SECRET` | Server-only API secret used for order creation, authenticated gateway lookups, and payment signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Separate webhook signing secret. |
| `RESEND_API_KEY` | Server-only email key. Verify the sending domain `ebenezerministries.in` in Resend. |
| `YOUTUBE_API_KEY` | Server-only YouTube Data API v3 key for actual broadcast/processing/replay status. |
| `YOUTUBE_TAMIL_KANNADA_PLAYLIST_ID` | Optional dedicated Tamil/Kannada playlist ID. |
| `YOUTUBE_ENGLISH_HINDI_PLAYLIST_ID` | Optional dedicated English/Hindi playlist ID. |
| `YOUTUBE_TAMIL_KANNADA_VIDEO_ID` | Optional current Tamil/Kannada broadcast ID, including an unlisted event. |
| `YOUTUBE_ENGLISH_HINDI_VIDEO_ID` | Optional current English/Hindi broadcast ID. |

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

Enable **YouTube Data API v3** in a Google Cloud project, create an API key restricted to that API, and configure `YOUTUBE_API_KEY` in Vercel and `.env.local`. Redeploy Vercel/restart the local server after changing environment variables. This key is used only on the server, in Google's request header; it never appears in the browser bundle, HTML, or `/api/live` response. The integration is prepared; a real key has not yet been configured or exercised.

Both languages always have separate controls. The server uses YouTube's `liveBroadcastContent`, actual start/end times, upload status, duration and embedding permission to distinguish **Upcoming → Live now → Replay being prepared → Watch replay**. An end timestamp overrides a stale live flag. Titles and Sunday schedules discover/classify candidates; they never prove that a broadcast is live. The newest active service is selected automatically unless a visitor has chosen a language or started watching. Explicit `?service=tamil-kannada` and `?service=english-hindi` links keep that choice.

`/live` is dynamically rendered and `/api/live` is not browser/CDN cached. Open pages poll every 30 seconds, resume checking when visible/online, and offer manual refresh. Shared server metadata caches revalidate every 30 seconds; Next's stale-while-revalidate behavior and YouTube propagation can add delay. Cached verification timestamps are preserved, and live/upcoming/processing assertions expire after 90 seconds without a fresh check (the browser checks expiry every 15 seconds). Refresh failures retain existing videos with a status-unavailable notice. Background refreshes keep an existing iframe and its matching title/date/YouTube link on the watched ID. A newly available stream can be chosen explicitly without interrupting playback.

Discovery combines the public Atom feed (60-second cache), up to 150 channel uploads and 50 entries per configured language playlist (five-minute cache), optional pinned broadcast IDs, and public live search. Shared live search has a five-minute cache during Sunday 7 AM–1 PM IST and a one-hour cache otherwise, per cache namespace. Concurrent refreshes coalesce within each running instance and failed refreshes back off for their cache interval. A broadcast absent from the feed/known IDs can therefore take five minutes plus cache/YouTube propagation during that window, or an hour outside it. Google's current [quota documentation](https://developers.google.com/youtube/data/determine_quota_cost) gives search its own default 100-call daily bucket; this cadence normally stays within that allowance for one deployment. Cold starts across instances, multiple previews/deployments, or other applications sharing the key can add calls and consume the same quota. Metadata checks continue when search quota fails for an already known ID.

Playlist IDs are discovery/archive sources, rather than iframe overrides. Every selected video and its metadata must belong to the church's channel, and each button opens that exact video. Flexible titles such as “Sunday Worship Service” are accepted. For title-independent classification, put the event in its dedicated language playlist or configure the corresponding current broadcast ID. Set these before the service, preferably when scheduling the event; clear/update a pinned ID when it is no longer needed. No generic channel `/live` link can silently route a visitor to the other language.

The last two successful replay candidates per language are retained in Next's data cache when new discovery results no longer contain that language; failed/empty refreshes do not overwrite successful archive/feed data. Each retained ID is rechecked before making current claims, and a successful API response omitting an old ID does not resurrect a deleted/private video. This cache is not permanent archival storage; a cleared/new cache must rediscover recordings from uploads, a configured playlist, or a pinned ID. Dedicated language playlists are recommended for reliable long-term discovery. YouTube may still restrict playback by location, account, or copyright; an exact-video external link remains available.

With no key, the public feed still supplies language-specific videos, labelled **Status unavailable** without claiming they are live or replay-ready. Missing matches retain their own language's YouTube search/playlist link. The product page contains no credential/setup instructions. The original homepage background video is unchanged.

## SEO and headers

Every public page has a title, description, canonical URL and social metadata. `/sitemap.xml` and `/robots.txt` use the configured canonical origin. Vercel previews are marked noindex. The thank-you page is noindex and omitted from the sitemap. The church schema uses existing public church details.

The Content Security Policy restricts frame and network origins to the app, YouTube, Maps and Razorpay. Static Next.js hydration requires inline scripts under this policy; a nonce-based policy would require dynamic rendering or a different build strategy. Production does not allow `unsafe-eval`. Confirm Checkout and Maps after any provider-origin changes.
