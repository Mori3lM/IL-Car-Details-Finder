import Link from "next/link";

/** Site footer — indicative-data disclaimer + trust/privacy links. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__wrap">
        <p className="disclaimer">
          המידע אינפורמטיבי, ממקורות משרד התחבורה (data.gov.il), ואינו תחליף לבדיקה
          פיזית של הרכב.
        </p>
        <nav aria-label="קישורי מידע">
          <Link href="/about-data">מאיפה הנתונים?</Link>
          <Link href="/privacy">פרטיות</Link>
        </nav>
      </div>
    </footer>
  );
}
