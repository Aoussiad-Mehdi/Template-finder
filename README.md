# Squarespace Template Finder

Production-ready MVP built with Next.js + TypeScript + Tailwind + Prisma + PostgreSQL + Playwright.

## What it does

- Accepts a public URL and analyzes its platform (Squarespace, WordPress, Shopify, Webflow, Wix, Framer, custom/unknown).
- For Squarespace sites:
  - Detects likely version (7.0 vs 7.1).
  - 7.0: returns likely family + likely template + confidence.
  - 7.1: returns closest template match + confidence.
  - Always returns a separate recommended template for rebuilding a similar site.
- Builds affiliate CTA links dynamically from template slug via a single helper.
- Stores full job, reasons, raw signals JSON, and screenshot.
- Includes admin tools for templates, affiliate config, and reanalysis.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Prisma + PostgreSQL
- Playwright for rendered capture
- Zod for validation
- In-process queue + in-memory rate limiter
- Vitest for tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Generate Prisma client and apply schema:

```bash
npm run prisma:generate
npx prisma db push
```

4. Seed starter data:

```bash
npm run seed
```

5. Run app:

```bash
npm run dev
```

After setup, one command starts local development:

```bash
npm run dev
```

## Environment variables

Required:

- `DATABASE_URL`
- `ADMIN_PASSWORD`
- `ANALYSIS_CACHE_HOURS`
- `PLAYWRIGHT_TIMEOUT_MS`
- `NEXT_PUBLIC_APP_URL`

Optional fallbacks:

- `AFFILIATE_BASE_URL` (default: `https://squarespace.syuh.net/Kj69Jv`)
- `AFFILIATE_DEEP_LINK_MODE` (`query` default, or `path`)

## API endpoints

- `POST /api/analyze`
- `GET /api/analyze/:id`
- `GET /api/templates`
- `POST /api/admin/template`
- `POST /api/admin/affiliate-config`
- `POST /api/admin/reanalyze/:id`

## Authentication

- Public endpoints (`POST /api/analyze`, `GET /api/analyze/:id`, `GET /api/templates`) do **not** require an API key for MVP.
- Admin write endpoints require the `x-admin-password` header to match `ADMIN_PASSWORD`.

## Affiliate link helper

`buildAffiliateLink(templateSlug: string): Promise<string>`

- Mode `path`: `https://squarespace.syuh.net/Kj69Jv/templates/{slug}`
- Mode `query` (default): `https://squarespace.syuh.net/Kj69Jv?u=https://www.squarespace.com/templates/{slug}`

Always uses recommended template slug.

## Testing

```bash
npm test
```

Includes tests for URL normalization, affiliate link generation, platform/version scoring, 7.0 family scoring, recommendation logic, API validation, and admin auth.

## Notes

- Detection is intentionally honest and explainable, not overconfident.
- For heavily customized sites, the app surfaces uncertainty and still gives practical rebuild recommendations.
- Architecture is separated for future SaaS expansion (bulk analysis, accounts, API plans, analytics).
