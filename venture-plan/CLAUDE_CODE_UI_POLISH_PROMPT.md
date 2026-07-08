# Claude Code prompt — UI polish pass (responsive + accessibility menu + content)

Paste the block below into Claude Code, run from the repo root.

---

```text
UI polish pass on the existing local Next.js app. Do NOT change the architecture, the server gov-proxy, the cache/rate-limit seams, or add any cloud/paid service. Local-first only. Read venture-plan/06_DESIGN_DIRECTION.md (§6 responsive, §7 section order, §8 content) and venture-plan/12_ACCESSIBILITY.md (§4 accessibility menu + statement) and venture-plan/05_BUILD_SPEC.md M6 — implement exactly those. Three tasks:

TASK 1 — Responsive desktop layout (fix "looks too small on desktop"):
- In app/globals.css: make the page container fluid — width: min(100% - 2rem, var(--container)) with --container growing to ~1120–1180px on desktop (keep ~680px reading width only where prose needs it). Add side padding always.
- Fluid typography with clamp(): h1 ~clamp(1.6rem,1.1rem+2.2vw,2.6rem), body ~clamp(1rem,.96rem+.3vw,1.15rem). Apply to headings + body so text isn't tiny on big screens.
- Result page app/car/[plate]/page.tsx + components/VehicleCard.tsx: on ≥900px use a two-column layout — main column (identity + technical details grid) and a sticky sidebar (components/StatusRow + components/SaveActions). On mobile: single column, status + actions first.
- Details grid: grid-template-columns: repeat(auto-fit, minmax(180px,1fr)) (2 cols mobile, 3–4 desktop).
- Keep touch targets ≥44px and 200% zoom intact.

TASK 2 — Accessibility menu + statement (Israeli legal requirement, self-built, NO third-party overlay):
- New component components/AccessibilityMenu.tsx: a fixed accessibility button (♿, aria-label "תפריט נגישות", keyboard-focusable) that opens a menu with: font-size increase/decrease (scale root rem), high-contrast/dark toggle, highlight links, readable-font toggle, stop-animations, reset, and a link to /accessibility. Persist choices in localStorage; apply via a class/data-attribute on <html>. Fully keyboard operable, focus-trapped when open, Esc closes, each control has an accessible name. Mount it in app/layout.tsx.
- New page app/accessibility/page.tsx — "הצהרת נגישות" — listing: conformance (WCAG 2.1 AA + ת"י 5568), the actual adjustments made (keyboard nav, visible focus, alt text, contrast, headings, RTL, aria-live, the accessibility menu), known limitations (recalls/owner-count not available; MOT data may lag), a contact for accessibility issues (use placeholder email ACCESSIBILITY_CONTACT — ask me for the real address), and a last-updated date. Link it in components/SiteFooter.tsx.

TASK 3 — Richer content (fuller, more trustworthy, better SEO):
- app/page.tsx: a proper hero (value headline + subhead + the search box + trust line "ממקורות רשמיים · חינם · ללא הרשמה"), then sections: "איך זה עובד" (3 steps w/ icons from components/Icons.tsx), "מה מקבלים" (feature cards), and an FAQ (האם זה חינם? מאיפה המידע? האם רשמי? מה לא זמין? האם המידע נשמר?) with FAQPage schema.org JSON-LD.
- components/SiteFooter.tsx: richer footer — links to /about-data, /privacy, /accessibility, data.gov.il credit + indicative-data disclaimer.
- Natural friendly Hebrew, not over-markety.

CONSTRAINTS: reuse existing design tokens/colors (don't break the verified WCAG AA contrast); statuses stay text+icon not color-only; keep dir=rtl/lang=he; visible focus everywhere; no outline:none without replacement.

AFTER implementing: run npm run build, npm test, and the axe/Lighthouse a11y checks on / , /car/[plate], and /accessibility — they must still pass (axe 0 errors, Lighthouse a11y ≥95). Take screenshots at 1440/1024/768/375 to confirm the desktop layout fills the width and scales. Then git add -A + git commit -m "M6: responsive desktop layout, accessibility menu + statement, richer content" + git push origin main, and report the commit hash.
```
