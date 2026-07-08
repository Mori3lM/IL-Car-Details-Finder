import { SearchBox } from "@/components/SearchBox";
import { CarIcon, CalendarPlusIcon, BookmarkIcon } from "@/components/Icons";

export default function HomePage() {
  return (
    <main id="main" className="page">
      <section className="hero">
        <h1>בדיקת רכב לפי מספר רישוי</h1>
        <p className="hero__lede">
          הזינו מספר רישוי וקבלו כרטיס רכב נקי מנתוני משרד התחבורה הרשמיים — חינם,
          ללא הרשמה.
        </p>
        <SearchBox variant="hero" />
        <p className="trust">
          <span>ממקורות משרד התחבורה</span>
          <span aria-hidden="true">·</span>
          <span>חינם</span>
          <span aria-hidden="true">·</span>
          <span>ללא חשבון</span>
        </p>
      </section>

      <section aria-labelledby="features-h">
        <h2 id="features-h" className="visually-hidden">
          מה מקבלים
        </h2>
        <ul className="features">
          <li className="feature">
            <div className="feature__icon">
              <CarIcon />
            </div>
            <h3>פרטי הרכב</h3>
            <p>יצרן, דגם, שנה, צבע, סוג דלק, קבוצת זיהום, VIN וסוג בעלות — מהמרשם הרשמי.</p>
          </li>
          <li className="feature">
            <div className="feature__icon">
              <CalendarPlusIcon />
            </div>
            <h3>רישוי וטסט</h3>
            <p>סטטוס תוקף הרישוי עם ספירת ימים — ותזכורת יומן להורדה (קובץ ICS).</p>
          </li>
          <li className="feature">
            <div className="feature__icon">
              <BookmarkIcon />
            </div>
            <h3>שמירה מקומית</h3>
            <p>שמרו רכבים בדפדפן שלכם בלבד — בלי חשבון ובלי לשלוח דבר לשרת.</p>
          </li>
        </ul>
      </section>
    </main>
  );
}
