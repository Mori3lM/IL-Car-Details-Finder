import { SearchBox } from "@/components/SearchBox";
import {
  CarIcon,
  CalendarPlusIcon,
  BookmarkIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/Icons";
import { buildFaqJsonLd, serializeJsonLd, type FaqItem } from "@/lib/seo";

const FAQ: FaqItem[] = [
  {
    q: "האם השירות חינם?",
    a: "כן, לחלוטין. אין תשלום, אין הרשמה ואין צורך בחשבון. כל אחד יכול לבדוק רכב בחינם.",
  },
  {
    q: "מאיפה המידע?",
    a: "המידע מגיע ממאגרי המידע הפתוחים הרשמיים של משרד התחבורה, דרך data.gov.il — מאגר הרכבים הפרטיים והמסחריים.",
  },
  {
    q: "האם המידע רשמי?",
    a: "המידע מגיע מהמרשם הרשמי של משרד התחבורה, אך הוא אינפורמטיבי בלבד, עשוי להתעדכן באיחור, ואינו תחליף לבדיקה פיזית של הרכב.",
  },
  {
    q: "מה לא זמין?",
    a: "מספר בעלים קודמים וריקולים/קריאות בטיחות אינם נכללים במאגר הפתוח, ולכן מסומנים בבירור כ״לא זמין״ במקום להציג מידע לא מדויק.",
  },
  {
    q: "האם המידע שלי נשמר?",
    a: "לא. אין חשבונות ואין איסוף מידע אישי בשרת. רכבים שאתם שומרים נשמרים אך ורק בדפדפן שלכם (localStorage) ולא נשלחים לשום מקום.",
  },
];

export default function HomePage() {
  const faqJsonLd = buildFaqJsonLd(FAQ);

  return (
    <main id="main" className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="hero">
        <h1>כל מה שהמדינה יודעת על הרכב — במספר אחד</h1>
        <p className="hero__lede">
          הזינו מספר רישוי וקבלו כרטיס רכב נקי ומאורגן, עם סטטוס רישוי וטסט —
          ישירות מנתוני משרד התחבורה.
        </p>
        <SearchBox variant="hero" />
        <p className="trust">
          <span>ממקורות רשמיים</span>
          <span aria-hidden="true">·</span>
          <span>חינם</span>
          <span aria-hidden="true">·</span>
          <span>ללא הרשמה</span>
        </p>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="how-h">
        <div className="section__head">
          <h2 id="how-h">איך זה עובד</h2>
          <p>שלושה צעדים פשוטים, בלי הרשמה ובלי התקנה.</p>
        </div>
        <ol className="steps">
          <li className="step">
            <div className="step__icon" aria-hidden="true">
              <SearchIcon />
            </div>
            <p className="step__kicker">שלב 1</p>
            <h3>מזינים מספר רישוי</h3>
            <p>מקלידים את מספר הרישוי בשדה החיפוש — 5 עד 8 ספרות.</p>
          </li>
          <li className="step">
            <div className="step__icon" aria-hidden="true">
              <CarIcon />
            </div>
            <p className="step__kicker">שלב 2</p>
            <h3>מקבלים כרטיס רכב</h3>
            <p>פרטי הרכב, סטטוס הרישוי והטסט, וספירת הימים לחידוש — בעמוד אחד.</p>
          </li>
          <li className="step">
            <div className="step__icon" aria-hidden="true">
              <CalendarPlusIcon />
            </div>
            <p className="step__kicker">שלב 3</p>
            <h3>שומרים ומקבלים תזכורת</h3>
            <p>שומרים את הרכב בדפדפן ומורידים תזכורת יומן לחידוש הרישוי בזמן.</p>
          </li>
        </ol>
      </section>

      {/* What you get */}
      <section className="section" aria-labelledby="features-h">
        <div className="section__head">
          <h2 id="features-h">מה מקבלים</h2>
          <p>כל המידע החשוב על הרכב, נגיש וברור.</p>
        </div>
        <ul className="features">
          <li className="feature">
            <div className="feature__icon" aria-hidden="true">
              <CarIcon />
            </div>
            <h3>פרטי הרכב</h3>
            <p>יצרן, דגם, שנה, צבע, סוג דלק, קבוצת זיהום, VIN וסוג בעלות — מהמרשם הרשמי.</p>
          </li>
          <li className="feature">
            <div className="feature__icon" aria-hidden="true">
              <CalendarPlusIcon />
            </div>
            <h3>רישוי וטסט</h3>
            <p>סטטוס תוקף הרישוי עם ספירת ימים — ותזכורת יומן להורדה (קובץ ICS).</p>
          </li>
          <li className="feature">
            <div className="feature__icon" aria-hidden="true">
              <BookmarkIcon />
            </div>
            <h3>שמירה מקומית</h3>
            <p>שמרו רכבים בדפדפן שלכם בלבד — בלי חשבון ובלי לשלוח דבר לשרת.</p>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-h">
        <div className="section__head">
          <h2 id="faq-h">שאלות נפוצות</h2>
          <p>כמה דברים שכדאי לדעת לפני שמתחילים.</p>
        </div>
        <div className="faq">
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="section" aria-labelledby="trust-h">
        <div className="feature feature--center">
          <div className="feature__icon" aria-hidden="true">
            <ShieldIcon />
          </div>
          <h3 id="trust-h">פרטי, נגיש, וללא עלות</h3>
          <p>
            אין חשבונות ואין איסוף מידע אישי. האתר נגיש לפי תקן ישראלי (WCAG 2.1 AA),
            והנתונים באדיבות data.gov.il.
          </p>
        </div>
      </section>
    </main>
  );
}
