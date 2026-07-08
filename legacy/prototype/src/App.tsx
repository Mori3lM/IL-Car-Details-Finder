import { useEffect, useState } from "react";
import { Home } from "./pages/Home";
import { AboutData } from "./pages/AboutData";
import { SavedCars } from "./components/SavedCars";

type Route = "home" | "saved" | "about";

function parseHash(): { route: Route; plate?: string } {
  const h = window.location.hash.replace(/^#\/?/, "");
  const [seg, param] = h.split("/");
  if (seg === "saved") return { route: "saved" };
  if (seg === "about") return { route: "about" };
  if (seg === "car" && param) return { route: "home", plate: param.replace(/\D/g, "") };
  return { route: "home" };
}

export default function App() {
  const [state, setState] = useState(parseHash());

  useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (route: Route) => { window.location.hash = route === "home" ? "" : `#/${route}`; };
  const openCar = (plate: string) => { window.location.hash = `#/car/${plate}`; };

  return (
    <>
      <a className="skip-link" href="#main">דלג לתוכן הראשי</a>

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="#" onClick={(e) => { e.preventDefault(); go("home"); }}>
            <span className="logo" aria-hidden="true">רכ</span>
            <span>כרטיס רכב</span>
          </a>
          <nav className="header-nav" aria-label="ניווט ראשי">
            <a href="#" aria-current={state.route === "home" ? "page" : undefined} onClick={(e) => { e.preventDefault(); go("home"); }}>חיפוש</a>
            <a href="#/saved" aria-current={state.route === "saved" ? "page" : undefined} onClick={(e) => { e.preventDefault(); go("saved"); }}>הרכבים שלי</a>
            <a href="#/about" aria-current={state.route === "about" ? "page" : undefined} onClick={(e) => { e.preventDefault(); go("about"); }}>מאיפה הנתונים</a>
          </nav>
        </div>
      </header>

      <main id="main">
        {state.route === "home" && <Home autoPlate={state.plate} key={state.plate ?? "home"} />}
        {state.route === "saved" && (
          <>
            <h1>הרכבים שלי</h1>
            <p className="hint">רשימת הרכבים ששמרתם — נשמרת בדפדפן זה בלבד.</p>
            <SavedCars onOpen={openCar} />
          </>
        )}
        {state.route === "about" && <AboutData />}
      </main>

      <footer className="site-footer">
        <div className="wrap">
          המידע אינפורמטיבי, ממקורות משרד התחבורה (data.gov.il), ואינו תחליף לבדיקה פיזית של הרכב.{" "}
          <a href="#/about" onClick={(e) => { e.preventDefault(); go("about"); }}>פרטים נוספים</a>
        </div>
      </footer>
    </>
  );
}
