import Link from "next/link";
import { A11yMenuButton } from "./A11yMenuButton";

/** Richer site footer — navigation, data credit, and the indicative-data disclaimer. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__wrap">
        <div className="site-footer__grid">
          <div className="site-footer__col">
            <h2>כרטיס רכב</h2>
            <p className="disclaimer">
              בדיקת רכב חינמית לפי מספר רישוי, מנתוני משרד התחבורה. מובייל־פירסט,
              נגיש, ללא הרשמה.
            </p>
          </div>

          <div className="site-footer__col">
            <h2>נגישות</h2>
            <Link href="/accessibility">הצהרת נגישות</Link>
            <A11yMenuButton className="footer-linkish">
              פתיחת תפריט נגישות
            </A11yMenuButton>
          </div>

          <nav className="site-footer__col" aria-label="קישורי מידע">
            <h2>מידע</h2>
            <Link href="/about-data">מאיפה הנתונים?</Link>
            <Link href="/privacy">מדיניות פרטיות</Link>
          </nav>

          <nav className="site-footer__col" aria-label="ניווט">
            <h2>ניווט</h2>
            <Link href="/">דף הבית</Link>
            <Link href="/my-cars">הרכבים שלי</Link>
          </nav>
        </div>

        <div className="site-footer__credit">
          <p className="disclaimer">
            הנתונים באדיבות{" "}
            <a href="https://data.gov.il" target="_blank" rel="noopener noreferrer">
              data.gov.il
            </a>{" "}
            (משרד התחבורה), בשימוש הוגן למידע ציבורי פתוח.
          </p>
          <p className="disclaimer">
            המידע אינפורמטיבי בלבד, עשוי להתעדכן באיחור, ואינו תחליף לבדיקה פיזית של
            הרכב.
          </p>
        </div>
      </div>
    </footer>
  );
}
