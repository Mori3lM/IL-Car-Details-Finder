import Link from "next/link";
import { SearchBox } from "./SearchBox";
import { AlertTriangleIcon, InfoIcon, SearchIcon } from "./Icons";
import { formatPlate } from "@/lib/validation/plate";

/** Invalid plate — offer to correct it. */
export function InvalidState({
  plate,
  message,
}: {
  plate: string;
  message: string;
}) {
  return (
    <div className="state state--error">
      <div className="state__icon">
        <AlertTriangleIcon />
      </div>
      <h1>מספר רישוי לא תקין</h1>
      <p>{message}</p>
      <SearchBox initialValue={plate.replace(/\D/g, "")} variant="hero" />
    </div>
  );
}

/** No matching vehicle. */
export function NotFoundState({ plate }: { plate: string }) {
  const pretty = formatPlate(plate.replace(/\D/g, ""));
  return (
    <div className="state">
      <div className="state__icon">
        <SearchIcon />
      </div>
      <h1>לא נמצא רכב</h1>
      <p>
        לא נמצא רכב עם מספר הרישוי {pretty} במאגר משרד התחבורה. בדקו את הספרות ונסו
        שוב.
      </p>
      <SearchBox variant="hero" />
    </div>
  );
}

/** Upstream/registry failure — recoverable, invite a retry. */
export function ErrorState() {
  return (
    <div className="state state--error">
      <div className="state__icon">
        <InfoIcon />
      </div>
      <h1>אירעה שגיאה</h1>
      <p>
        לא הצלחנו לשלוף את הנתונים מהמאגר הממשלתי כרגע. ייתכן שהמאגר עמוס — נסו שוב
        בעוד רגע.
      </p>
      <div className="actions">
        <Link className="btn btn--primary" href="/">
          חזרה לחיפוש
        </Link>
      </div>
    </div>
  );
}
