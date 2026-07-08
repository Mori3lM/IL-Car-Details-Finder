import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "בדיקת רכב לפי מספר רישוי — נתונים רשמיים",
    template: "%s | כרטיס רכב",
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
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <a className="skip-link" href="#main">
          דלג לתוכן הראשי
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
