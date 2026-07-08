import type { Metadata } from "next";
import Link from "next/link";
import { RESOURCES } from "@/lib/govData/resources";

export const metadata: Metadata = {
  title: "מאיפה הנתונים?",
  description:
    "מקורות הנתונים של כרטיס רכב — מאגרי משרד התחבורה ב-data.gov.il, ומה זמין ומה לא.",
};

export default function AboutDataPage() {
  return (
    <main id="main" className="page page--prose">
      <h1>מאיפה הנתונים?</h1>
      <p>
        כל הנתונים באתר מגיעים ממאגרי המידע הפתוחים הרשמיים של משרד התחבורה, דרך{" "}
        <a href="https://data.gov.il" target="_blank" rel="noopener noreferrer">
          data.gov.il
        </a>
        . אנחנו מתווכים אליהם דרך השרת שלנו (כדי לפתור מגבלות דפדפן), שומרים תוצאה
        זמנית ב-cache, ולא משנים את הנתונים.
      </p>

      <section className="card" aria-labelledby="src-h">
        <h2 id="src-h">המקור העיקרי</h2>
        <p>
          <strong>{RESOURCES.core.label}</strong>
        </p>
        <p>
          מאגר הרכבים הפרטיים והמסחריים הפעילים (למעלה מ-4 מיליון רכבים).{" "}
          <a
            href={RESOURCES.core.datasetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            צפייה במאגר
          </a>
          .
        </p>
      </section>

      <section className="card" aria-labelledby="avail-h">
        <h2 id="avail-h">מה זמין</h2>
        <ul className="bullets">
          <li>זהות הרכב: יצרן, דגם מסחרי, רמת גימור, שנת ייצור, צבע וסוג דלק.</li>
          <li>פרטים טכניים: דגם מנוע, קבוצת זיהום, צמיגים ומספר שלדה (VIN).</li>
          <li>תוקף רישוי (תאריך) ותאריך הטסט האחרון.</li>
          <li>סוג בעלות (פרטי / חברה / השכרה וכו׳).</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="na-h">
        <h2 id="na-h">מה לא זמין (ומסומן ”לא זמין”)</h2>
        <p>
          כדי לא להטעות, אנחנו לא ממציאים נתונים שהמאגר הפתוח לא מספק. הפריטים הבאים
          מוצגים כ”לא זמין”:
        </p>
        <ul className="bullets">
          <li>מספר בעלים קודמים — נמצא במאגר נפרד שטרם אומת ומחובר.</li>
          <li>ריקולים וקריאות בטיחות פתוחות — מאגר נפרד, טרם חובר.</li>
          <li>שעבודים, עיקולים והיסטוריית תאונות — אינם במאגר הפתוח.</li>
        </ul>
      </section>

      <p>
        המידע אינפורמטיבי, ייתכנו עיכובים בעדכון המאגרים, והוא אינו תחליף לבדיקה
        פיזית של הרכב. ראו גם <Link href="/privacy">מדיניות הפרטיות</Link>.
      </p>
    </main>
  );
}
