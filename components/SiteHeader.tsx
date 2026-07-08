import Link from "next/link";
import { CarIcon } from "./Icons";

/** Site header — logo + wordmark, links home. Rendered by the root layout. */
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
      </div>
    </header>
  );
}
