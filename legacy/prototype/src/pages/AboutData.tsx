import { RESOURCES } from "../lib/govData/resources";

export function AboutData() {
  return (
    <>
      <h1>מאיפה הנתונים?</h1>
      <div className="card">
        <p>
          כל המידע באתר נשלף בזמן אמת ממאגרי <strong>הנתונים הפתוחים של ממשלת ישראל</strong>{" "}
          (<a href="https://data.gov.il" target="_blank" rel="noopener noreferrer">data.gov.il</a>),
          משרד התחבורה והבטיחות בדרכים. האתר אינו שומר את הנתונים שלכם בשום שרת.
        </p>
        <h2 style={{ marginTop: "1rem" }}>המאגרים שבשימוש</h2>
        <ul>
          <li>
            <a href={RESOURCES.core.datasetUrl} target="_blank" rel="noopener noreferrer">{RESOURCES.core.label}</a>{" "}
            — פרטי הרכב, סוג בעלות, תוקף רישוי ותאריך טסט אחרון.
          </li>
        </ul>
        <h2 style={{ marginTop: "1rem" }}>מה עדיין לא זמין</h2>
        <p>
          מספר בעלים קודמים, היסטוריית ריקולים מפורטת, שעבודים/עיקולים והיסטוריית תאונות מלאה{" "}
          <strong>אינם זמינים במאגר הפתוח החינמי</strong> (חלקם מצריכים מקור בתשלום). לכן במקום להציג ניחוש,
          האתר מסמן “לא זמין” בשקיפות.
        </p>
        <h2 style={{ marginTop: "1rem" }}>הבהרה</h2>
        <p>
          המידע אינפורמטיבי בלבד, נשען על עדכוני משרד התחבורה (ייתכן עיכוב בעדכון) ו<strong>אינו תחליף
          לבדיקה פיזית</strong> של הרכב לפני קנייה.
        </p>
        <h2 style={{ marginTop: "1rem" }}>פרטיות</h2>
        <p>
          “הרכבים שלי” והעדפות נשמרים ב‑<code>localStorage</code> בדפדפן שלכם בלבד ואינם נשלחים לשום מקום.
          ניקוי היסטוריית הדפדפן או לחיצה על “נקה” מוחקים אותם לחלוטין.
        </p>
      </div>
    </>
  );
}
