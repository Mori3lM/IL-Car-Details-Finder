# כרטיס רכב · IL Car Details Finder

בדיקת רכב חינמית לפי מספר רישוי — פרטי הרכב, סטטוס רישוי וטסט, ותזכורת ליומן. ממקורות רשמיים של משרד
התחבורה ([data.gov.il](https://data.gov.il)). **מקומי‑תחילה** (local‑first), מבוסס‑שרת, **ללא חשבונות**.
מובייל‑פירסט, RTL, ונגיש לפי **WCAG 2.1 AA**.

> **מקומי לחלוטין:** האתר רץ במלואו על המחשב שלך עם `npm` בלבד — **ללא ענן, ללא DB, ללא שירות בתשלום,
> ללא סודות.** שרת ה‑Next.js המקומי מתווך אל data.gov.il (פותר CORS), שומר תוצאות ב‑cache בזיכרון, ומגביל
> קצב. מעבר ל‑production הוא שלב נפרד ומאוחר (ראה `venture-plan/05_BUILD_SPEC.md §6`) — לא נבנה כרגע.

> **מקור הפרויקט:** נבנה מחדש מתוך ה‑CLI המקורי של Python. הסקריפט המקורי נשמר תחת
> [`legacy/code.py`](legacy/code.py), והפרוטוטייפ הקודם (Vite/React) נשמר תחת `legacy/prototype/`
> — כ**חומר עזר בלבד**. האפליקציה נבנית מחדש לפי `venture-plan/05_BUILD_SPEC.md`.

## מה זה עושה
- חיפוש רכב לפי מספר רישוי דרך **ה‑API של השרת** (`/api/vehicle/[plate]`) — הדפדפן לעולם לא פונה ישירות
  ל‑gov. השרת מנרמל, מאמת (Zod), מושך, ממפה לעברית, ומחזיר JSON טיפוסי.
- דף רכב **מרונדר בשרת (SSR)** `‎/car/[plate]` — אינדקסבילי, שיתופי, מהיר.
- סטטוס **רישוי וטסט** עם ספירת ימים, בטקסט+אייקון (לא רק צבע).
- **שמירת רכב** מקומית (`localStorage`) — בלי חשבון, שום דבר לא נשלח לשרת.
- **תזכורת ליומן** — הורדת קובץ `.ics` לחידוש רישוי (Google/Apple/Outlook). אפס backend, אפס PII.
- שקיפות מלאה: מקור לכל נתון, ו"לא זמין" מפורש למה שהמאגר הפתוח לא מספק (מספר בעלים, ריקולים).

## טכנולוגיות
**Next.js (App Router) · TypeScript · Zod · Vitest · Playwright + @axe-core · ESLint.**
Cache ובקרת קצב מאחורי ממשקים (`CacheStore` / `RateLimiter`) עם מימוש בזיכרון — **אפס תלות בשירות בתשלום.**

## דרישות מקדימות
- **Node.js 18.18+** (מומלץ 20+) ו‑**npm**. אין צורך בשום חשבון ענן, מפתח API, או סוד.

## הרצה מקומית
```bash
npm install
cp .env.local.example .env.local     # ללא סודות; ברירות מחדל תקינות (גם קובץ ריק עובד)
npm run dev                          # http://localhost:3000
npm test                             # בדיקות יחידה (Vitest)
npm run build                        # בניית production (מאמת שהכול עובר)
npm run test:e2e                     # Playwright + axe (מריץ את שרת הפיתוח אוטומטית)
```

> להרצת בדיקות ה‑e2e בפעם הראשונה יש להתקין את דפדפני Playwright פעם אחת:
> `npx playwright install chromium`.

### משתני סביבה (`.env.local.example`)
לכל המפתחות יש ברירת מחדל עובדת — האפליקציה רצה גם עם `.env.local` ריק. **אין סודות.**

| מפתח | ברירת מחדל | תיאור |
|---|---|---|
| `GOV_API_BASE` | `https://data.gov.il/api/3/action/datastore_search` | נקודת הקצה של המאגר (בשרת בלבד) |
| `CACHE_TTL_SECONDS` | `86400` | תוקף התוצאה ב‑cache (24 שעות) |
| `CACHE_DRIVER` | `memory` | מנוע ה‑cache (`memory` למקומי) |
| `RATE_LIMIT_MAX` | `30` | מקסימום בקשות ל‑IP בחלון |
| `RATE_LIMIT_WINDOW_MS` | `60000` | גודל חלון בקרת הקצב (מ״ש) |
| `RATE_LIMIT_DRIVER` | `memory` | מנוע בקרת הקצב (`memory` למקומי) |

## ארכיטקטורה (התפרים למעבר ל‑production)
כל קריאות data.gov.il הן **בצד השרת בלבד**. ה‑route handler תלוי ב**ממשקים** `CacheStore` ו‑`RateLimiter`,
לעולם לא במימוש קונקרטי — כך שהמעבר ל‑production (Redis/Upstash) הוא החלפת מימוש + env, לא כתיבה מחדש.

```
app/
  (public)/       דף בית, ‎/car/[plate] (SSR), ‎/about-data, ‎/privacy, ‎/my-cars
  api/vehicle/[plate]   GET — proxy לשרת + cache + בקרת קצב
lib/
  govData/        adapter, resources, fieldMap, types   ← השכבה היחידה שמכירה את ה‑API הגולמי
  cache/          CacheStore (ממשק) + MemoryCache        ← תפר מעבר
  rateLimit/      RateLimiter (ממשק) + MemoryRateLimiter ← תפר מעבר
  validation/     סכמות Zod
  ics/            buildIcs()
  storage/        עזרי localStorage (לקוח)
  config.ts       קריאת env עם ברירות מחדל מקומיות
components/       SearchBox, VehicleCard, StatusCard, SavedCars, states, SkipLink
legacy/           code.py (מקור) + prototype/ (פרוטוטייפ Vite ישן — עזר בלבד)
venture-plan/     חבילת התכנון המלאה
```

## נגישות (חובה — שער בנייה)
- כל זוגות הצבע (בהיר וכהה) עוברים ניגודיות **WCAG 2.1 AA**.
- HTML סמנטי, skip‑link, landmarks, תוויות טפסים, `aria-live` לתוצאה, `role="alert"` לשגיאות.
- ניווט מקלדת מלא עם focus גלוי; סטטוסים בטקסט+אייקון, לא רק בצבע; `dir="rtl"`, `lang="he"`.
- שער M5: axe עם 0 שגיאות + Lighthouse a11y ≥ 95 + מעבר ידני של מקלדת וקורא‑מסך.
- צ'קליסט מלא: [`venture-plan/12_ACCESSIBILITY.md`](venture-plan/12_ACCESSIBILITY.md).

## פרטיות ואבטחה
ללא חשבונות וללא PII בשרת. ה‑state היחיד בשרת הוא cache אנונימי (מספר רישוי → נתוני מרשם ציבוריים).
שמירות "הרכבים שלי" נשארות ב‑`localStorage` על המכשיר בלבד. פירוט: `venture-plan/07_SECURITY_SPEC.md`.

## רישיון
MIT. הנתונים באדיבות data.gov.il (משרד התחבורה). המידע אינפורמטיבי ואינו תחליף לבדיקה פיזית.
