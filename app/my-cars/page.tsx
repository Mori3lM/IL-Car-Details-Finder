import type { Metadata } from "next";
import { MyCars } from "@/components/MyCars";

export const metadata: Metadata = {
  title: "הרכבים שלי",
  description:
    "הרכבים ששמרתם — נשמרים בדפדפן זה בלבד, עם סטטוס רישוי ותזכורות יומן. ללא חשבון.",
};

export default function MyCarsPage() {
  return (
    <main id="main" className="page">
      <h1>הרכבים שלי</h1>
      <p className="hero__lede">
        הרכבים ששמרתם מופיעים כאן, עם סטטוס הרישוי הנוכחי. הרשימה פרטית ונשמרת בדפדפן
        זה בלבד.
      </p>
      <MyCars />
    </main>
  );
}
