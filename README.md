# RescueNet

A visibility engine for at-risk shelter animals. Shelters list animals facing euthanasia with urgency tiers and deadlines; the public browses listings to help — share, foster, or adopt before time runs out.

## Features

- **Public listings** — browse urgent animals filterable by species, urgency tier, and state, with a countdown to each listing's deadline
- **Listing detail pages** — full animal profile, shelter contact info, and a photo gallery with drag-free prev/next navigation
- **Admin dashboard** — Google-authenticated, allowlist-gated admin area to manage shelters, animals, and listings
- **Photo management** — direct-to-R2 presigned uploads, drag-to-reorder, primary photo selection, all with concurrency-safe ordering guarantees
- **Status history** — every listing status change (active → rescued/adopted/euthanized/etc.) is recorded as an audit trail

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Database**: PostgreSQL 16 (via Docker for local dev)
- **ORM**: Prisma
- **Auth**: Auth.js v5 (Google OAuth, admin allowlist via `ADMIN_EMAILS`)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod
- **Image storage**: Cloudflare R2 via `@aws-sdk/client-s3`, direct browser-to-bucket presigned uploads

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)
- A Google OAuth client ID/secret ([console.cloud.google.com](https://console.cloud.google.com))
- A Cloudflare R2 bucket + API token ([dash.cloudflare.com](https://dash.cloudflare.com) → R2)

### Setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
docker compose up -d         # start PostgreSQL
npm run db:migrate           # run Prisma migrations
npm run db:seed              # (optional) seed sample data
npm run dev                  # start the dev server at localhost:3000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `TEST_DATABASE_URL` | Separate database (same Postgres instance) used only by integration tests |
| `AUTH_SECRET` | Auth.js session secret — generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client credentials |
| `ADMIN_EMAILS` | Comma-separated allowlist of emails permitted to sign in |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 credentials, scoped to Object Read & Write on one bucket |
| `R2_PUBLIC_URL` | The bucket's public base URL (its `r2.dev` dev URL, or a custom domain) |

R2 buckets need a CORS policy allowing `PUT`/`GET`/`HEAD` from your app's origin(s) before uploads will work in the browser — set this in the Cloudflare dashboard under the bucket's Settings → CORS Policy.

## Commands

```bash
docker compose up -d           # Start PostgreSQL
npm run db:migrate             # Run Prisma migrations
npm run db:seed                # Seed sample data
npm run db:studio              # Open Prisma Studio (DB GUI)
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run lint                   # ESLint
npm test                       # Run unit tests (pure logic, no DB)
npm run test:watch             # Unit tests in watch mode
npm run test:integration:setup # One-time: sync the schema to the test database
npm run test:integration       # Run integration tests (real DB, mocked auth/R2)
```

## Project Structure

- `src/app/` — Next.js App Router pages
- `src/components/` — React components (`ui/` = shadcn primitives, `layout/`, `listings/`, `forms/`)
- `src/lib/` — Utilities (Prisma client, auth config, Zod validators, R2 client, misc helpers)
- `src/actions/` — Server Actions (mutations)
- `src/data/` — Server-only data access functions (queries)
- `prisma/` — Schema, migrations, seed script

## Data Model

- **Animal** — stable identity (breed, age, temperament). Does not carry urgency or status.
- **Listing** — an urgent situation tied to an animal: urgency tier, optional deadline, risk reason, verification status, and lifecycle status.
- **StatusHistory** — audit trail for every listing status change.
- **Photo** — images stored in Cloudflare R2, referenced by URL, with an admin-managed order and primary flag.

## Auth

Admin access is restricted to emails listed in `ADMIN_EMAILS`. `/admin/*` routes are gated by `src/proxy.ts` (a fast cookie-presence check) with the authoritative session check happening server-side on each admin page. Public routes (`/`, `/listings`, `/about`) require no authentication.
