import { useState, type FormEvent } from "react";
import { normalizePlate } from "../lib/plate";

interface Props {
  initial?: string;
  onSearch: (plate: string) => void;
}

export function SearchBox({ initial = "", onSearch }: Props) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | undefined>();

  function submit(e: FormEvent) {
    e.preventDefault();
    const res = normalizePlate(value);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(undefined);
    onSearch(res.value);
  }

  return (
    <form className="search" role="search" aria-label="חיפוש רכב לפי מספר רישוי" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="plate">מספר רישוי</label>
      <input
        id="plate"
        name="plate"
        inputMode="numeric"
        autoComplete="off"
        placeholder="הזינו מספר רישוי"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby={error ? "plate-error plate-hint" : "plate-hint"}
        aria-invalid={error ? true : undefined}
      />
      <button type="submit">חפש</button>
      {error ? (
        <p id="plate-error" className="field-error" role="alert" style={{ flexBasis: "100%" }}>{error}</p>
      ) : null}
    </form>
  );
}
