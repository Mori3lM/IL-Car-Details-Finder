// Home page (M0: minimal RTL landing that proves SSR + tokens + a11y foundation).
// The full search UI + design system land in M2.

export default function HomePage() {
  return (
    <main id="main" className="container">
      <h1>בדיקת רכב לפי מספר רישוי</h1>
      <p className="lede">
        הזינו מספר רישוי וקבלו כרטיס רכב נקי מנתוני משרד התחבורה הרשמיים — חינם,
        ללא הרשמה, ללא צורך בחשבון.
      </p>
      <p className="trust">
        ממקורות data.gov.il&nbsp;· הנתונים נשמרים מקומית בדפדפן שלכם&nbsp;· ללא חשבון
      </p>
    </main>
  );
}
