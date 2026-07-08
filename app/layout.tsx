import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "בדיקת רכב לפי מספר רישוי — נתונים רשמיים",
    template: "%s | בדיקת רכב",
  },
  description:
    "הזינו מספר רישוי וקבלו כרטיס רכב נקי מנתוני משרד התחבורה הרשמיים (data.gov.il) — חינם, ללא הרשמה.",
};

export const viewport: Viewport = {
  themeColor: "#1e6fb8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <a className="skip-link" href="#main">
          דלג לתוכן הראשי
        </a>
        {children}
      </body>
    </html>
  );
}
