import Link from "next/link";
import { CarIcon } from "./Icons";

/** Site header — logo + wordmark (links home) and a link to the saved list. */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__wrap">
        <Link className="brand-link" href="/">
          <span className="logo" aria-hidden="true">
            <CarIcon />
          </span>
          <span>כרטיס רכב</span>
        </Link>
        <nav className="site-nav" aria-label="ניווט ראשי">
          <Link href="/my-cars">הרכבים שלי</Link>
        </nav>
      </div>
    </header>
  );
}
