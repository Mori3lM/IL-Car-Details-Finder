# 22 · DevOps & הפעלה (מבוסס‑שרת, ללא DB)

> **שלב נוכחי: LOCAL‑FIRST.** בונים ומריצים הכל מקומית (`npm run dev`) בלי שום ענן. המסמך הזה מתאר בעיקר
> את **שלב המיגרציה** ל‑production — שיקרה מאוחר יותר, כהחלטה נפרדת (ר' `05 §6`). כרגע: אין deploy, אין
> ענן, אין CI מרוחק — רק המחשב שלך. פשוט מאוד — אין DB, אין jobs (בליבה), הכל שכבת‑חינם.

## מקומי (השלב הנוכחי)
- `npm install` → `npm run dev` → http://localhost:3000. `.env.local` בלי סודות (ברירות מחדל עובדות).
- Cache ובקרת קצב: **in‑memory** מאחורי interfaces (`CacheStore`/`RateLimiter`) — אפס תלות חיצונית.
- בדיקות רצות מקומית: `npm test` + `npm run test:e2e` (Playwright + axe).
- אין מה לפרוס ואין מה לגבות בשלב הזה.

## סקר אירוח (מה נבחר ולמה)
| אופציה | מתאים ל | חינם? | הכרעה |
|---|---|---|---|
| **Vercel (Hobby)** | Next.js SSR + route handlers | כן (מגבלות סבירות לפרויקט) | **נבחר** — native ל‑Next.js, HTTPS, edge, rollback מיידי |
| Render (Free web service) | שרת תמידי, בלי מגבלת זמן פונקציה | כן (750 ש'/חודש) | חלופה אם רוצים שרת תמידי במקום serverless |
| Cloudflare Pages + Functions | סטטי + פונקציות edge | כן | חלופה; פחות native ל‑Next SSR |

**Cache:** ברירת מחדל — מנגנון ה‑cache המובנה של Next (`revalidate`/`unstable_cache`) — אפס תלות חיצונית.
אם רוצים cache משותף בין אינסטנסים — **Upstash Redis** (שכבת‑חינם). לא חובה לליבה.

## סביבות
- **Local:** `npm run dev`. אין DB ⇒ אין setup מסד נתונים; רק (אם בכלל) מפתחות cache/monitoring ב‑`.env`.
- **Production:** Vercel, מחובר ל‑repo. משתני סביבה ב‑Vercel Env.
- `.env.example` מתעד כל מפתח; `.env` ב‑gitignore. הליבה שואפת ל‑**אפס סודות**.

## CI/CD (GitHub Actions — חינם)
- על כל PR: `lint` + `typecheck` + `vitest` + Playwright e2e **כולל axe** + Lighthouse CI (שער a11y ≥95).
- merge ל‑main → פריסה אוטומטית ב‑Vercel.
- ה‑build נכשל אם יש שגיאת נגישות — הנגישות היא שער, לא בדיקה ידנית בלבד.

## ניטור ותצפית
- שגיאות: Vercel logs; אופציונלי **Sentry** (שכבת‑חינם) ל‑error tracking בצד שרת.
- ביצועים: Vercel Analytics / Lighthouse CI.
- בריאות ה‑gov API: alert אם שיעור כשלי proxy עולה (log-based).

## גיבוי ו‑DR
- **אין DB ⇒ אין מה לגבות.** ה‑cache הוא ארעי ונבנה מחדש מ‑gov. הקוד ב‑Git. פריסה קודמת ניתנת לשחזור
  מיידי דרך Vercel rollback.

## עלות (Cost Dashboard — סיכום)
| רכיב | תוכנית | עלות חודשית |
|---|---|---|
| אירוח (Vercel Hobby) | חינם | ₪0 |
| Cache (Next built-in / Upstash free) | חינם | ₪0 |
| CI (GitHub Actions) | חינם | ₪0 |
| דומיין (אופציונלי) | — | ~$10–15/שנה אם רוצים דומיין מותאם |
| **סה"כ burn** | | **₪0** (דומיין אופציונלי בלבד) |

> אם S4 (תזכורת מייל ללא חשבון) תופעל: יתווספו Neon (חינם) + Resend (3K/חודש חינם) + Vercel Cron (חינם).
> עדיין ₪0 בהיקף אישי — אך זו החלטה נפרדת שדורשת אישורך.
