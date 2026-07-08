# 29 · Handoff Kit — start here (for Claude Code)

> Index telling Claude Code what to read and how to start, so the build begins fast and correctly.

## What you're building
A **LOCAL-FIRST**, server-backed, **account-free** Hebrew RTL website: search an Israeli plate →
server-rendered car card from official data.gov.il data (proxied + cached in the local server) → save
locally + `.ics` reminder. Runs entirely on your machine with only `npm` — **no cloud accounts, no DB,
no paid services.** Production migration is a later, separate, seam-based step (`05 §6`). Free,
WCAG 2.1 AA. Full spec: **`05_BUILD_SPEC.md`**.

## Read in this order
1. `05_BUILD_SPEC.md` — the executable plan (stack, milestones M0–M5, DoD + verify each). **Primary.**
2. `00_PROFILE.md` — product profile + why server-without-accounts.
3. `04_FEATURE_SPEC.md` — MoSCoW scope, user stories + acceptance, data model.
4. `07_SECURITY_SPEC.md` — server security controls (validation, no-SSRF, rate-limit, XSS, secrets, privacy).
5. `12_ACCESSIBILITY.md` — the WCAG 2.1 AA checklist + verification protocol (the M5 gate).
6. `06_DESIGN_DIRECTION.md` — design tokens + layout to implement faithfully.
7. `22_DEVOPS.md` — hosting, CI, cost.

## Reuse from the prototype (reference only — don't depend on `src/` as the product)
- Hebrew field-translation map: `src/lib/govData/fieldMap.ts`.
- Plate normalization logic: `src/lib/plate.ts`.
- `.ics` builder + logic patterns: `src/lib/ics.ts`, `src/lib/govData/adapter.ts` (port into the server version).
- The confirmed core resource id and live field names are documented in `05 §2`.

## First actions (all local — `npm run dev`, no cloud)
1. Scaffold Next.js (App Router) + TS + Zod + Vitest + Playwright + ESLint (M0); add `MemoryCache` +
   `MemoryRateLimiter` behind their interfaces; `.env.local.example` (no secrets).
2. Build `lib/govData/` adapter + `GET /api/vehicle/[plate]` with cache + rate-limit (M1) — the heart.
3. SSR `/car/[plate]` with the design tokens (M2).
Then M3 (localStorage + `.ics`), M4 (trust/SEO/privacy), M5 (accessibility gate). Production migration
(`05 §6`) is a separate later phase — don't build it now.

## Stop-and-ask before (see `05 §10`)
Adding accounts/auth/DB, any cloud/paid service, the optional email feature, a domain, real secrets, or
anything in the production-migration section (`05 §6`).

## Definition of done
`05_BUILD_SPEC §11` — beautiful, accessible, server-rendered card from official data, local save + `.ics`,
free/account-free/DB-free, axe clean + Lighthouse a11y ≥95 + manual a11y pass.
