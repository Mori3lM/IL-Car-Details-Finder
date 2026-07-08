# 05 · BUILD SPEC — "Car Card" (LOCAL-FIRST, server-backed, no accounts)

> **Audience: Claude Code.** English, imperative, milestone-based.
> **Mode: LOCAL-FIRST.** Build and run the entire app **locally** (`npm run dev`, http://localhost:3000)
> with **zero cloud accounts and zero paid services**. Design clean seams (interfaces + env) so moving to
> production later is a **migration, not a rewrite** — see §Migration. No user accounts, no auth, no
> database. The server (local Next.js) proxies data.gov.il (solves CORS), caches, and rate-limits;
> saving is client-side (localStorage); reminders are `.ics` downloads.
>
> **Do not depend on the existing `src/` prototype** as the product — reference only. You MAY reuse the
> Hebrew field-translation map and plate-normalization logic. Idea origin:
> https://github.com/Mori3lM/IL-Car-Details-Finder (preserved at `legacy/code.py`).

---

## 0. Product in one line
A Hebrew, RTL, mobile-first, server-rendered site (running locally for now) where anyone searches an
Israeli plate → clean car card from official data.gov.il data (fetched through the local server, cached) →
save locally + download an `.ics` reminder. No sign-up, runs fully offline-of-cloud on your machine.

## 1. Stack (all local, no cloud accounts needed to build or run)

| Concern | Local choice | Migration seam |
|---|---|---|
| Framework | **Next.js 14+ (App Router) + TypeScript** | same in prod |
| Server data | **Route Handler** `/api/vehicle/[plate]` (runs in local dev server) | same code deploys as-is |
| Cache | **in-memory `MemoryCache` (Map + TTL)** behind a `CacheStore` interface | swap impl → Redis/Upstash via env, no route changes |
| Rate limit | **in-memory token bucket** behind a `RateLimiter` interface | swap impl → shared store in prod |
| Validation | **Zod** | same |
| Client save | **localStorage** | same |
| Reminders | **`.ics`** generated client-side | same |
| Tests | **Vitest** (unit) + **Playwright + @axe-core/playwright** (e2e + a11y) — all run locally | same in CI later |
| Config | **`.env.local`** (no secrets: gov base URL, cache TTL, rate-limit params) | prod: same keys via host env |

> Everything above runs on a laptop with only `npm`. **No database, no Vercel, no Upstash, no Resend, no
> domain** required for the local build. Those appear only in §Migration, later, and only if chosen.

## 2. Data source (server-side, works locally)
- Base (env `GOV_API_BASE`, default `https://data.gov.il/api/3/action/datastore_search`); core resource
  `053cea08-09bc-40ec-8f7a-156f0677aff3` (confirmed live, 4.1M vehicles), query `q=<plate>`.
- The **local** Next.js server makes the gov call (Node fetch has no CORS restriction server-side). The
  browser calls only `/api/vehicle/[plate]`.
- `lib/govData/` adapter: normalized plate → fetch → filter to exact `mispar_rechev` → map Hebrew labels
  (reuse prototype map) → typed `VehicleReport`. Confirmed core fields: manufacturer, commercial model,
  trim, year, colour, fuel, engine model, pollution group, tyres, VIN, road-entry date, last test
  (mivchan_acharon_dt), licence validity (tokef_dt), ownership type (baalut). Owner-count + recalls are
  separate **unverified** datasets → render "לא זמין" (never invent).

## 3. Project structure
```
/app
  /(public)/                 home, /car/[plate] (SSR), /about-data, /privacy, /my-cars (client, localStorage)
  /api/vehicle/[plate]       GET — server proxy + cache + rate-limit
/lib/govData                 adapter, resources, fieldMap, types
/lib/cache                   CacheStore interface + MemoryCache (local)     ← migration seam
/lib/rateLimit               RateLimiter interface + MemoryRateLimiter       ← migration seam
/lib/validation              Zod schemas
/lib/ics                     buildIcs()
/lib/storage                 localStorage helpers (client)
/components                  SearchBox, VehicleCard, StatusCard, SavedCars, states, SkipLink
.env.local.example
```
**Seam rule:** route handlers depend on the `CacheStore` / `RateLimiter` **interfaces**, never on a concrete
impl. Local wires `MemoryCache` / `MemoryRateLimiter`; production swaps the impl via one factory + env. This
single rule is what makes the later migration config-only.

## 4. Local setup (first thing in the README Claude Code writes)
```bash
npm install
cp .env.local.example .env.local     # no secrets needed; sane defaults
npm run dev                          # http://localhost:3000
npm test                             # unit
npm run test:e2e                     # Playwright + axe (spins up the dev server)
```
`.env.local.example` keys: `GOV_API_BASE`, `CACHE_TTL_SECONDS=86400`, `RATE_LIMIT_WINDOW_MS`,
`RATE_LIMIT_MAX`. All have working defaults; the app runs with an empty `.env.local`.

## 5. Milestones (each ends with a Definition of Done + verification — all LOCAL)

### M0 — Foundation (local)
Scaffold Next.js + TS + Zod + Vitest + Playwright + ESLint. Add `MemoryCache` + `MemoryRateLimiter` behind
their interfaces. `.env.local.example` committed; `.env.local` git-ignored.
**DoD:** `npm run dev` serves the home page on localhost; `npm run build` passes; `npm test` runs.
**Verify:** fresh clone → `npm i && npm run dev` boots with no cloud credentials; `npm run build` passes.

### M1 — Server data layer + gov proxy (the heart, local)
`GET /api/vehicle/[plate]`: Zod-validate → `CacheStore.get` (serve within TTL) → else fetch gov → map →
`CacheStore.set` → return typed JSON. `RateLimiter` per IP. Adapter is the only module that knows the raw
API shape.
**DoD:** on localhost, a real plate → typed translated JSON; invalid → 400; not-found → 404; gov failure →
handled 502 (no stack); second identical request is a cache hit (no upstream call); rate limit triggers
after N requests. **Verify:** unit tests (normalize/map/missing→"לא זמין"/error path, recorded fixtures) +
route integration tests (cache hit/miss, 400/404/502, rate-limit) + manual `curl localhost:3000/api/...`
with 3 real plates + 1 fake.

### M2 — SSR result page + design system (make it beautiful)
Server-render `/car/[plate]` with tokens from `06_DESIGN_DIRECTION.md`: VehicleCard → StatusCard
(licence/test, most prominent, days remaining) → owners → recalls → sources. Full RTL, mobile-first, all
states. "שמור" + "תזכורת ליומן" actions.
**DoD:** on localhost the page is server-rendered (view-source shows the data); every block shows source +
date; works at 320px; no CLS on the status card. **Verify:** view-source confirms SSR; Lighthouse mobile
perf ≥90 (local run); screenshots 320/768/1440.

### M3 — Save locally + `.ics` reminders (client)
"Save car" → localStorage, shown in `/my-cars` with status chips (remove + clear-all). "Add calendar
reminder" → valid `.ics` for the licence date, configurable lead time (default 30d).
**DoD:** saved cars persist across reloads in the same browser; UI note says data is local-only; `.ics`
opens in a real calendar app. **Verify:** reload persistence test; open a generated `.ics`; unit-test the
ics builder.

### M4 — Trust, SEO & privacy (local)
`/about-data` (sources + what's not available) and `/privacy` (anonymous cache, local-only saves, no PII,
indicative-data disclaimer). schema.org `Vehicle`, meta/OG on `/car/[plate]`, sitemap, robots.
**DoD:** every block traceable to a source; disclaimer present; structured data validates locally.
**Verify:** validate structured data (schema.org validator on the rendered HTML); manual privacy review vs `07`.

### M5 — Accessibility verification gate (MANDATORY, local)
Prove WCAG 2.1 AA per `12_ACCESSIBILITY.md` across home, result, my-cars — all tested locally.
**DoD:** axe 0 errors; Lighthouse a11y ≥95; full keyboard nav + visible focus; screen-reader pass
(VoiceOver/NVDA) reads card/statuses/errors; statuses = text+icon (not color alone); 200% zoom;
`lang=he dir=rtl`; skip link; result region `aria-live`; labeled inputs + `role="alert"` errors.
**Verify:** `@axe-core/playwright` run locally = 0 errors; local Lighthouse a11y ≥95; record a manual
keyboard + screen-reader pass with screenshots. **Not done on automated checks alone.**

### M6 — UI polish: responsive desktop + accessibility menu + richer content (added from user feedback)
Three things, all local:
1. **Responsive desktop layout** (`06 §6`/`§7`): fluid container (`min(100% - 2rem, ~1120px)` on desktop),
   fluid typography via `clamp()`, and a **two-column result layout ≥900px** (main details column +
   sticky status/actions sidebar; single column on mobile with status first). Details grid uses
   `auto-fit minmax(180px,1fr)`. Fix the "looks too small on desktop" problem. Keep consistent section
   order and generous vertical rhythm.
2. **Accessibility menu + statement** (`12 §4`, Israeli legal requirement): a self-built, keyboard-
   accessible accessibility button/menu (font-size ±, high-contrast/dark toggle, highlight links, readable
   font, stop animations, reset, link to statement) with choices persisted in `localStorage`; and an
   `/accessibility` **הצהרת נגישות** page listing conformance (WCAG 2.1 AA + IS 5568), the actual
   adjustments made, known limitations, a contact for accessibility issues, and a last-updated date. Do
   NOT use a third-party overlay widget.
3. **Richer content** (`06 §8`): home hero (value headline + subhead + search + trust line), "how it
   works" (3 steps), "what you get" feature cards, an FAQ section (free? source? official? what's not
   available? is data stored?) with `FAQPage` schema, and a richer footer (about-data, privacy,
   accessibility statement, data.gov.il credit + disclaimer). Natural Hebrew copy.
**DoD:** on a 1440px desktop the site fills the width and reads at a comfortable size (not a narrow mobile
column); the accessibility menu works by keyboard, persists, and every control has an accessible name; the
`/accessibility` statement page is present with real detail; new content sections render and are keyboard/
screen-reader friendly; **M5's accessibility gate is re-run and still passes** (axe 0, Lighthouse a11y ≥95).
**Verify:** screenshots at 1440/1024/768/375 showing proper scaling; keyboard-drive the a11y menu and
confirm persistence across reload; re-run axe + Lighthouse on home/result/accessibility pages; the FAQ
structured data validates.

## 6. Migration to production (LATER — do NOT build now; documented so the seams are right)
When the user decides to go live, this is the whole migration (small, because of the seams):
1. **Host:** deploy the same Next.js app to **Vercel** (or Render). No code change to routes.
2. **Cache:** implement `RedisCache` (Upstash free) satisfying `CacheStore`; select via `CACHE_DRIVER=redis`
   env. Local stays `memory`. (In-memory cache/rate-limit don't persist across serverless invocations —
   this swap is the reason the interface exists.)
3. **Rate limit:** implement the shared-store `RateLimiter` (Upstash) the same way.
4. **Headers/HTTPS:** add security headers (CSP, HSTS, X-Content-Type-Options) in `next.config`; HTTPS is
   automatic on the host.
5. **CI:** GitHub Actions runs lint + unit + e2e/axe + Lighthouse gate on PR; deploy on main.
6. **Domain (optional):** point a custom domain; update OG/sitemap base URL (env `SITE_URL`).
7. **Optional email reminders (separate decision):** only then add Neon + Resend + a cron route.
**Guarantee to preserve:** because routes depend on `CacheStore`/`RateLimiter` interfaces and read config
from env, steps 2–3 are new files + env, not edits to business logic.

## 7. Injected engineering standards (from 11)
Small single-purpose functions; adapter is the only place that knows the raw API; robust error handling on
every network call; Zod at the server boundary; typed `VehicleReport`; cache/rate-limit behind interfaces.
Tests: unit (adapter, plate, ics, date logic), integration (the API route incl. cache + rate-limit + error
paths), e2e smoke (search → result → save → ics). No premature abstraction.

## 8. Injected security requirements (from 07 — local + forward-compatible)
Zod-validate + normalize plate server-side; fixed upstream host (no SSRF); rate-limit + cache the route
(anti-enumeration, protect gov quota) — even locally; sanitize gov text before render (XSS: React only, no
`dangerouslySetInnerHTML`); **no secrets** in client bundle or git (the local build needs none);
`.env.local` git-ignored; no stack traces to clients; localStorage local-only with a UI note; indicative-
data disclaimer. Security headers are added at the migration step (§6.4) but CSP-friendly code from day one
(no inline event handlers, no `eval`). No auth/session/IDOR surface exists by design.

## 9. Accessibility & legal (from 12) — build gate
WCAG 2.1 AA is a legal requirement in Israel. Semantic HTML, verified-contrast tokens (`06`/`12`), keyboard
nav, focus, status text (not color alone), RTL — from M2, proven in M5, all locally.

## 10. Instruction model for Claude Code (how to work)
- **Precision dial:** contract, stack, seams, and security controls are **prescribed — implement, don't
  substitute.** Component breakdown, file naming, helper shapes are your latitude.
- **Autonomy vs checkpoint:** proceed autonomously on reversible local code (routes, components, styles,
  tests). **STOP and ask** before: adding any cloud/paid service, a database, the email feature, a domain,
  real secrets, or anything in §6 (that's a separate, user-approved phase).
- **Plan-first** on: the gov adapter (merge + missing-field handling) and the `CacheStore`/`RateLimiter`
  interfaces (get the seam right so migration stays cheap) — write the approach before coding.
- **Creative/visual direction is owned by this package** (`06`/`12`): implement faithfully; if a visual
  detail is undefined, ask rather than invent.

## 11. Guardrails (forbidden — do not violate)
- Do NOT build any §6 migration item now — local-first only, until the user says go.
- Do NOT add accounts, auth, a database, or any cloud/paid service to the local build.
- Do NOT couple route handlers to a concrete cache/rate-limit impl — depend on the interface (the seam).
- Do NOT depend on / resurrect the client-only `src/` prototype as the product; build fresh.
- Do NOT call data.gov.il from the browser; all gov calls are server-side.
- Do NOT store secrets in the client bundle or git; never commit `.env.local`.
- Do NOT invent data the gov API doesn't return (liens, accident history, owner count until wired) → "לא זמין".
- Do NOT ship `outline:none` without an equal-or-better visible focus style.
- Do NOT mark M5 (accessibility) done without the manual keyboard + screen-reader pass.
- Do NOT fake success: a milestone is done only when its Verify step passes.

## 12. Definition of Done (local MVP)
On the developer's machine (`npm run dev`), anyone can search a plate and get a beautiful, accessible,
server-rendered RTL car card (licence/test status, details, sources) served fast via the in-memory cache
from official data — save it locally and download an `.ics` reminder — with **zero cloud accounts**, axe
clean, Lighthouse a11y ≥95, secrets-free, and a passed manual a11y review. The cache/rate-limit seams are
in place so production migration (§6) is config + two small adapters, not a rewrite.
