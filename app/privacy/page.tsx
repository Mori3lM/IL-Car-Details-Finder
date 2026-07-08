import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "פרטיות",
  description:
    "מדיניות הפרטיות של כרטיס רכב — אין חשבונות, אין PII בשרת, שמירה מקומית בלבד.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="page page--prose">
      <h1>פרטיות</h1>
      <p>
        האתר תוכנן כך שייאסף עליכם כמה שפחות מידע — בעצם, כמעט כלום. אין חשבונות, אין
        הרשמה, ואין מידע אישי מזהה שנשמר בשרת.
      </p>

      <section className="card" aria-labelledby="p1">
        <h2 id="p1">בלי חשבונות ובלי PII בשרת</h2>
        <p>
          אין מערכת משתמשים, אין התחברות ואין סיסמאות. השרת לא שומר מי חיפש מה.
        </p>
      </section>

      <section className="card" aria-labelledby="p2">
        <h2 id="p2">Cache אנונימי</h2>
        <p>
          כדי להאיץ תשובות ולהגן על מכסת המאגר הממשלתי, השרת שומר זמנית (עד 24 שעות)
          את תוצאת הרכב לפי מספר הרישוי בלבד — נתוני מרשם ציבוריים, ללא כל מזהה של
          מי שחיפש.
        </p>
      </section>

      <section className="card" aria-labelledby="p3">
        <h2 id="p3">שמירה מקומית בלבד</h2>
        <p>
          ”הרכבים שלי” וההעדפות נשמרים ב-<code>localStorage</code> בדפדפן שלכם בלבד.
          שום דבר מזה לא נשלח אלינו או לשום שרת. מחיקת הנתונים מהדפדפן מוחקת אותם
          לחלוטין.
        </p>
      </section>

      <section className="card" aria-labelledby="p4">
        <h2 id="p4">תזכורות יומן</h2>
        <p>
          תזכורת הרישוי נוצרת כקובץ <code>.ics</code> שמופק בדפדפן ונשמר אצלכם.
          היומן שלכם שולח את ההתראה — אנחנו לא שולחים מיילים ולא מחזיקים את הכתובת
          שלכם.
        </p>
      </section>

      <p>
        המידע באתר אינפורמטיבי, ממקורות משרד התחבורה, ואינו תחליף לבדיקה פיזית.
        פרטים על המקורות: <Link href="/about-data">מאיפה הנתונים?</Link>.
      </p>
    </main>
  );
}
