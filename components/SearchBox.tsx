"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { parsePlate } from "@/lib/validation/plate";
import { AlertTriangleIcon, SearchIcon } from "./Icons";

interface SearchBoxProps {
  /** Prefill (e.g. on the result page so users can edit the current plate). */
  initialValue?: string;
  /** "hero" = large centered variant on the home page. */
  variant?: "hero" | "inline";
}

/**
 * Plate search. Validates client-side for instant feedback (errors announced via
 * role="alert"), then navigates to the SSR /car/[plate] page. The server
 * re-validates and re-fetches — this is a convenience layer, not the guard.
 */
export function SearchBox({ initialValue = "", variant = "inline" }: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parsePlate(value);
    if (!parsed.ok) {
      setError(parsed.error ?? "מספר רישוי לא תקין");
      return;
    }
    setError(null);
    router.push(`/car/${parsed.value}`);
  }

  return (
    <form
      className={`search ${variant === "hero" ? "search--hero" : ""}`.trim()}
      role="search"
      aria-label="חיפוש רכב לפי מספר רישוי"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="visually-hidden">
        <label htmlFor={inputId}>מספר רישוי</label>
      </div>
      <input
        id={inputId}
        className="search__input"
        name="plate"
        inputMode="numeric"
        autoComplete="off"
        placeholder="מספר רישוי"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        aria-invalid={error ? true : undefined}
      />
      <button className="search__btn" type="submit">
        <SearchIcon />
        <span>חפש</span>
      </button>

      <p id={hintId} className="search__hint">
        הזינו 5–8 ספרות, עם או בלי מקפים.
      </p>
      {error && (
        <p id={errorId} className="search__error" role="alert">
          <AlertTriangleIcon />
          <span>{error}</span>
        </p>
      )}
    </form>
  );
}
