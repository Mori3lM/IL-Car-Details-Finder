# Kickoff prompt for Claude Code

Copy everything in the block below into Claude Code, run from the repo root
(`il-car-details-finder/`).

---

You are building a **local-first**, server-backed, **account-free** website. Work from the planning
package already in this repo — do not invent scope.

**Read first, in this order (they're in `venture-plan/`):**
1. `venture-plan/29_HANDOFF_KIT.md` — the index / how to start.
2. `venture-plan/05_BUILD_SPEC.md` — the executable plan. THIS IS YOUR PRIMARY SPEC. Follow its
   milestones M0–M5, and honor its §6 (production migration is LATER — do not build it now), §10
   (how to work), and §11 (guardrails).
3. `venture-plan/00_PROFILE.md`, `04_FEATURE_SPEC.md`, `07_SECURITY_SPEC.md`, `12_ACCESSIBILITY.md`,
   `06_DESIGN_DIRECTION.md` — profile, features, security, the WCAG 2.1 AA gate, and design tokens.

**What to build (one line):** a Hebrew, RTL, mobile-first, server-rendered site where anyone enters an
Israeli license plate and gets a clean car card from official data.gov.il data — fetched through the
LOCAL Next.js server (solves CORS), cached in-memory, rate-limited — then saves cars in `localStorage`
and downloads an `.ics` calendar reminder. No accounts, no database, no cloud, no paid services.

**Hard constraints (from the spec — do not violate):**
- LOCAL-FIRST: everything must run with `npm install` + `npm run dev` on `http://localhost:3000`, with
  **zero cloud accounts and no secrets**. Build nothing from the §6 migration section yet.
- Cache and rate-limiting go **behind interfaces** (`CacheStore`, `RateLimiter`) with in-memory local
  impls. Route handlers depend on the interface, never a concrete impl. This seam is mandatory.
- All data.gov.il calls are **server-side only** (route handler). The browser calls only
  `/api/vehicle/[plate]`. Core resource id `053cea08-09bc-40ec-8f7a-156f0677aff3`.
- Reuse from the existing `src/` prototype **as reference only** (do not depend on it as the product):
  the Hebrew field-translation map and the plate-normalization logic. Build the app fresh per the spec.
- Never invent data the gov API doesn't return (owner count, recalls, liens) — render "לא זמין".
- WCAG 2.1 AA is a build gate (M5): axe 0 errors + Lighthouse a11y ≥95 + a manual keyboard &
  screen-reader pass. Statuses conveyed by text+icon, not color alone. Visible focus always.
- Stack: Next.js (App Router) + TypeScript + Zod + Vitest + Playwright/@axe-core. No DB.

**How to work:**
- Go milestone by milestone (M0→M5). After each, run its "Verify" step and only then continue.
- Proceed autonomously on reversible local code. **STOP and ask me** before: adding any cloud/paid
  service, a database, auth/accounts, the optional email feature, a domain, real secrets, or anything
  in `05 §6`.
- Plan-first (write your approach before coding) for: the gov adapter, and the `CacheStore` /
  `RateLimiter` interfaces.
- Implement the design tokens in `06_DESIGN_DIRECTION.md` faithfully; if a visual detail is undefined,
  ask rather than invent.

**Start now with M0:** scaffold the Next.js + TypeScript project (with Zod, Vitest, Playwright, ESLint),
add the `MemoryCache` + `MemoryRateLimiter` behind their interfaces, create `.env.local.example` (no
secrets, working defaults) and a README with the local run steps, and confirm `npm run dev` boots and
`npm run build` passes. Then show me the plan for M1 before implementing it.
