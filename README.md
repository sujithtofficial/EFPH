# Ebenezer Ministries (EFPH)

Next.js website for Ebenezer Ministries, Bengaluru. The existing church text and photo library are retained, with responsive navy, gold, and warm neutral styling.

## Development

Use Node.js 24.x and npm. The committed lockfile makes local and Vercel installs reproducible.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Public pages and language-specific service recordings work without credentials. Payment creation and contact delivery require the corresponding server keys. See [ENV_SETUP.md](ENV_SETUP.md).

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Security tests cover invalid donation amounts and donor details, payment/webhook signatures, captured-payment matching, contact validation and HTML escaping, request size/origin/content type, rate limits, and language-specific video selection.

## Deployment

The existing Vercel project uses `npm ci` and Node.js 24.x. Configure the variables described in [ENV_SETUP.md](ENV_SETUP.md) and review the [audit notes](docs/site-review.md). Branch deployments should remain unindexed; the production canonical origin defaults to the supplied Vercel URL. No new hosting service is required.
