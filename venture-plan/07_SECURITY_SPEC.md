# 07 · Security & Privacy Requirements (server-backed, no accounts)

> Architecture: a server that proxies data.gov.il, caches, and renders pages — **no accounts, no user
> database, no PII stored server-side.** That designs out the entire auth/session/IDOR risk class. What
> remains is a short, focused server-security list + privacy.

## Threat model (what we protect)
- The gov proxy endpoint — from plate enumeration and quota abuse.
- Rendering — from XSS via untrusted gov API text.
- The server — from SSRF and secret leakage.
- The user's device data (localStorage saves) — must never leave the browser.

## Controls (OWASP-web, only what's relevant)
1. **Input validation** — Zod-validate + normalize the plate/VIN server-side (whitelist digits, length
   5–8) before any upstream call.
2. **No SSRF** — the gov base URL is a fixed server constant; only the `q` param is user-derived and
   URL-encoded. User input never chooses the host.
3. **Rate limiting** — throttle `/api/vehicle/[plate]` per IP (and cache results) to prevent enumeration
   and protect the gov API quota.
4. **XSS** — treat all gov API text as untrusted: render via React (no `dangerouslySetInnerHTML`); if any
   raw HTML is ever needed, sanitize. Never `eval` API content.
5. **Secrets** — nothing secret in the client bundle or git. Any key (cache/monitoring) lives in server
   env only; `.env` git-ignored; `.env.example` provided. Ideally the core needs zero secrets.
6. **Transport & headers** — HTTPS (Vercel); security headers: CSP, HSTS, X-Content-Type-Options,
   Referrer-Policy, X-Frame-Options/frame-ancestors.
7. **Error hygiene** — never return stack traces or upstream internals to the client; log server-side,
   return friendly messages (400/404/502).
8. **Supply chain** — pin dependencies; `npm audit`/Dependabot; minimal package surface.

## Privacy-by-design
- **No accounts, no PII in the server.** The only server state is an **anonymous** vehicle cache
  (plate → public registry payload); it contains no personal identifier of the searcher.
- **Local-only saves:** "my cars" + prefs live in `localStorage` on the device, with a visible UI note.
  Nothing is transmitted to us.
- **Data minimization:** cache only what's needed; set a TTL; don't log full plates tied to IPs beyond
  transient rate-limit needs — redact in persistent logs.
- **Transparency:** `/about-data` lists sources + what's not available; `/privacy` states there are no
  accounts, the cache is anonymous, saves are local-only, and the info is indicative — not a substitute
  for a physical inspection.
- **Israel Privacy Protection Law:** with no personal data collected or stored server-side, the exposure
  is minimal; the public-registry data is open government data used for its intended purpose.

## If the optional email-reminder feature is enabled later
Then (and only then) add: double opt-in (confirm the email owns the subscription), a secret-protected cron
route, unsubscribe token per row, store only email+plate+dates, and a lawful-basis/retention note. Until
enabled, none of this exists.

## Per-milestone gate
Every milestone's DoD includes: inputs validated, gov text rendered safely, no secret committed, errors
handled without leaking internals.
