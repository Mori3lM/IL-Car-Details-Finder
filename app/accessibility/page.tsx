import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "הצהרת נגישות",
  description:
    "הצהרת הנגישות של כרטיס רכב — התאמה ל-WCAG 2.1 AA ולת\"י 5568, ההתאמות שבוצעו, מגבלות ידועות ואיש קשר.",
};

export default function AccessibilityStatementPage() {
  return (
    <main id="main" className="page page--prose">
      <h1>הצהרת נגישות</h1>
      <p>
        אנחנו רואים בנגישות האתר ערך עליון ומחויבות — כדי שכל אדם, לרבות אנשים עם
        מוגבלות, יוכל להשתמש בשירות בקלות, בעצמאות ובכבוד. האתר נבנה נגיש מהיסוד, ולא
        באמצעות תוסף/overlay חיצוני.
      </p>

      <section className="card" aria-labelledby="conf">
        <h2 id="conf">רמת ההתאמה</h2>
        <p>
          האתר שואף לעמוד בדרישות תקן ישראלי <strong>ת״י 5568</strong> ברמה{" "}
          <strong>AA</strong>, המבוסס על הנחיות{" "}
          <strong>WCAG 2.1 ברמה AA</strong> של ה-W3C.
        </p>
      </section>

      <section className="card" aria-labelledby="did">
        <h2 id="did">ההתאמות שבוצעו בפועל</h2>
        <ul className="bullets">
          <li>ניווט מלא במקלדת בלבד (Tab/Enter/Space), ללא מלכודות מקלדת.</li>
          <li>סימון פוקוס גלוי וברור על כל רכיב אינטראקטיבי.</li>
          <li>קישור ”דלג לתוכן” בראש כל עמוד.</li>
          <li>ניגודיות צבעים תקנית (טקסט ≥ 4.5:1), במצב בהיר ובמצב כהה.</li>
          <li>סטטוסים מסומנים בטקסט + אייקון, לא בצבע בלבד.</li>
          <li>מבנה סמנטי תקין: כותרות מסודרות, אזורי ניווט, טפסים עם תוויות.</li>
          <li>עדכונים דינמיים מוכרזים לקוראי מסך (aria-live), ושגיאות מסומנות כהתראות נגישות.</li>
          <li>תמיכה מלאה ב-RTL, בעברית, עם פורמט תאריכים ומספרים ישראלי.</li>
          <li>פריסה רספונסיבית שנשמרת עד רוחב 320px ובזום 200%.</li>
          <li>כיבוד העדפת ”הפחתת תנועה” (prefers-reduced-motion).</li>
          <li>
            <strong>תפריט נגישות</strong> קבוע: הגדלת/הקטנת טקסט, מצב כהה/ניגודיות
            גבוהה, הדגשת קישורים, גופן קריא, עצירת אנימציות ואיפוס — נשמר בין ביקורים.
          </li>
        </ul>
      </section>

      <section className="card" aria-labelledby="limits">
        <h2 id="limits">מגבלות ידועות</h2>
        <ul className="bullets">
          <li>
            חלק מהנתונים אינם זמינים במאגר הפתוח ולכן מסומנים ”לא זמין” — למשל מספר
            בעלים קודמים וריקולים/קריאות בטיחות.
          </li>
          <li>
            המידע מגיע ממאגרי משרד התחבורה ועשוי להתעדכן באיחור מול המצב בפועל.
          </li>
          <li>
            למרות מאמצינו, ייתכן שרכיב מסוים טרם הונגש במלואו. אנו פועלים לשיפור מתמיד
            — נשמח לקבל דיווח.
          </li>
        </ul>
      </section>

      <section className="card" aria-labelledby="contact">
        <h2 id="contact">פנייה בנושא נגישות (רכז נגישות)</h2>
        <p>
          נתקלתם בבעיית נגישות, או שיש לכם הצעה לשיפור? נשמח שתעדכנו אותנו, ונטפל בהקדם:
        </p>
        <ul className="bullets">
          <li>
            דוא״ל:{" "}
            <a href="mailto:ai@nanoks.com">ai@nanoks.com</a>
          </li>
        </ul>
        <p>נשתדל להשיב ולטפל בפניות נגישות בתוך זמן סביר.</p>
      </section>

      <p>
        <strong>תאריך עדכון ההצהרה:</strong> 8 ביולי 2026.
      </p>
      <p>
        ראו גם: <Link href="/about-data">מאיפה הנתונים?</Link> ·{" "}
        <Link href="/privacy">מדיניות פרטיות</Link>.
      </p>
    </main>
  );
}
