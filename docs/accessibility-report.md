# Accessibility Verification Report — M5 Gate (WCAG 2.1 AA)

> Record of the M5 accessibility gate from `venture-plan/05_BUILD_SPEC.md` §5 and the
> checklist in `venture-plan/12_ACCESSIBILITY.md`. All checks run **locally**.
> Pages covered: home (`/`), result (`/car/[plate]`), saved list (`/my-cars`), plus
> `/about-data` and `/privacy`.

## Automated

| Check | Tool | Result |
|---|---|---|
| axe — home | `@axe-core/playwright` (wcag2a/2aa/21a/21aa) | **0 violations** |
| axe — result page | same | **0 violations** |
| axe — my-cars (empty + populated) | same | **0 violations** |
| axe — about-data + privacy | same | **0 violations** |
| axe — **dark mode** (home/result/my-cars) | same, `colorScheme: dark` | **0 violations** |
| Lighthouse accessibility — home | Lighthouse (mobile) | **100** |
| Lighthouse accessibility — result | Lighthouse (mobile) | **100** |
| Lighthouse accessibility — my-cars | Lighthouse (mobile) | **100** |

Tests live in `e2e/a11y.spec.ts`. Re-run with `npm run test:e2e`.

## Keyboard (automated, `e2e/keyboard.spec.ts`)

- **Skip link** is the first tab stop and targets `#main`.
- The **full search flow** is operable by keyboard (type plate → Enter → SSR result).
- Interactive elements expose a **visible focus outline** (3px `:focus-visible` ring; no
  `outline:none` anywhere in the codebase).
- The **save** action is reachable by keyboard and toggles `aria-pressed`.

## Screen-reader structure

Verified via the platform **accessibility tree** (the API VoiceOver/NVDA consume). The
result page exposes: `banner` → labelled `navigation` → `main` → labelled `search` with a
labelled textbox → a labelled result `region` containing four labelled sub-regions
(identity, status, ownership, recalls) with a correct `h1` → `h2` hierarchy, `DescriptionList`
term/definition pairs, a live `status` region for save/reminder announcements, and
`aria-pressed` on the save toggle → `contentinfo`. Errors use `role="alert"`.

> A final human listen-through with VoiceOver (Safari/iOS) and/or NVDA (Windows) is
> recommended as the last human check; the semantic tree above is what those tools read.

## Perceivable / reflow / theming

- **Status is never colour-alone**: every status carries **text + icon + colour**
  (`StatusRow`, `StatusChip`, enrichment "לא זמין"). Confirmed present as text in the a11y tree.
- **Contrast**: design tokens (`app/globals.css`) verified for AA in light **and** dark;
  axe contrast checks pass in both themes.
- **Reflow / 320px**: no horizontal overflow at 320 px on the result and my-cars pages
  (`scrollWidth == clientWidth`). Equivalent to 400% zoom reflow (WCAG 1.4.10).
- **Resize text 200%**: layout uses relative units and logical properties; no clipping.
- `prefers-reduced-motion` honoured (animations reduced to ~0ms).

## Structure / robustness

- `<html lang="he" dir="rtl">`; RTL is first-class (CSS logical properties throughout).
- Semantic landmarks: `header/banner`, `nav` (labelled), `main`, `footer/contentinfo`.
- One `h1` per page; no skipped heading levels.
- Form field has an associated `<label>`; the search error is `role="alert"` and linked
  via `aria-describedby`.
- Touch targets ≥ 44px on interactive controls.

## Verdict

The M5 gate passes: **axe 0 errors**, **Lighthouse a11y 100** (≥95 required) across the
core pages, a passing keyboard pass, and a verified screen-reader semantic structure — in
both light and dark themes.

## M6 additions (accessibility menu + statement + responsive)

- **Self-built accessibility menu** (`components/AccessibilityMenu.tsx`, no third-party
  overlay): fixed ♿ button → native `<dialog>` (focus-trap + Esc for free). Controls: font
  size ±, theme (auto/light/dark/high-contrast), highlight links, readable font, stop
  animations, reset, and a link to the statement. Every control has an accessible name;
  choices persist in `localStorage` and apply to `<html>`. Keyboard-driven open/apply/persist
  and **axe-clean while open** are covered by `e2e/a11y-menu.spec.ts`.
- **Accessibility statement** at `/accessibility` — conformance (WCAG 2.1 AA + ת״י 5568),
  the adjustments made, known limitations, an accessibility contact (ai@nanoks.com), and a
  last-updated date. axe-clean (`e2e/a11y.spec.ts`), Lighthouse a11y 100.
- **Responsive desktop** — fluid container (up to ~1120px), `clamp()` typography, and a
  two-column result page ≥900px (wide details + sticky status/actions; single column with
  status first on mobile). Verified at 1440 / 1024 / 375, no horizontal overflow, 200% zoom
  intact. Re-ran the full gate: axe 0, Lighthouse a11y 100×3.
