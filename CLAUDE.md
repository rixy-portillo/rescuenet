# RescueNet — Project Guide

## What This Is

A visibility engine for at-risk shelter animals. Shelters list animals facing euthanasia with urgency tiers and deadlines. The public browses listings to help — share, foster, or adopt.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL 16 (Docker for local dev)
- **ORM**: Prisma (schema at `prisma/schema.prisma`)
- **Auth**: Auth.js v5 (Google OAuth, admin allowlist via `ADMIN_EMAILS` env var)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Validation**: Zod (schemas in `src/lib/validators.ts`)
- **Images**: Cloudflare R2 via `@aws-sdk/client-s3`

## Key Commands

```bash
docker compose up -d          # Start PostgreSQL
npm run db:migrate             # Run Prisma migrations
npm run db:seed                # Seed sample data
npm run db:studio              # Open Prisma Studio (GUI)
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm run lint                   # ESLint
```

## Project Structure

- `src/app/` — Next.js App Router pages
- `src/components/` — React components (ui/ = shadcn, layout/, listings/, forms/)
- `src/lib/` — Utilities (prisma.ts, auth.ts, validators.ts, utils.ts)
- `src/actions/` — Server Actions (mutations)
- `src/data/` — Server-only data access functions (queries)
- `prisma/` — Schema, migrations, seed

## Data Model

- **Animal** — Stable identity (breed, age, temperament). Does NOT have urgency or status.
- **Listing** — Represents an urgent situation for an animal. Has urgency tier, optional deadline, risk reason, verification status, and status (ACTIVE → RESCUED/ADOPTED/EUTHANIZED/etc).
- **StatusHistory** — Audit trail for every listing status change.
- **Photo** — Images stored in Cloudflare R2, referenced by URL.

## Conventions

- Use Server Components by default. Add `"use client"` only for interactivity.
- Mutations go through Server Actions in `src/actions/`.
- Data fetching goes through functions in `src/data/` called from Server Components.
- Zod schemas in `src/lib/validators.ts` are the single source of truth for validation.
- shadcn/ui components live in `src/components/ui/`.
- Prisma types are auto-generated — don't manually define DB entity types.

## Auth

- Admin-only for v1. Only emails in `ADMIN_EMAILS` can sign in.
- `/admin/*` routes are protected by middleware.
- Public routes (`/`, `/listings`, `/about`) require no auth.
