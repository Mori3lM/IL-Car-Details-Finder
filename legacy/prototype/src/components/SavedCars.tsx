import { useEffect, useState } from "react";
import { getSavedVehicles, removeVehicle, clearAllVehicles, type SavedVehicle } from "../lib/storage";
import { computeValidity } from "../lib/govData/adapter";
import { formatPlate } from "../lib/plate";

interface Props {
  onOpen: (plate: string) => void;
}

export function SavedCars({ onOpen }: Props) {
  const [list, setList] = useState<SavedVehicle[]>([]);

  useEffect(() => {
    setList(getSavedVehicles());
  }, []);

  if (list.length === 0) {
    return (
      <div className="card empty">
        <p><strong>עדיין לא שמרתם רכב.</strong></p>
        <p className="hint">חפשו רכב ולחצו “שמור את הרכב” כדי שיופיע כאן ותוכלו לחזור אליו.</p>
      </div>
    );
  }

  return (
    <>
      {list.map((v) => {
        const status = computeValidity(v.licenceExpiry, "רישוי");
        return (
          <div className="card saved-item" key={v.plate}>
            <div>
              <button
                className="btn"
                type="button"
                onClick={() => onOpen(v.plate)}
                style={{ border: 0, padding: 0, background: "none", color: "var(--brand-700)", fontWeight: 700 }}
              >
                {v.nickname || "רכב"}
              </button>
              <div className="sub" style={{ color: "var(--ink-600)" }}>{formatPlate(v.plate)}</div>
            </div>
            <span className={`chip ${status.level}`}>{status.label}</span>
            <button
              className="btn"
              type="button"
              aria-label={`הסר את ${v.nickname || formatPlate(v.plate)}`}
              onClick={() => setList(removeVehicle(v.plate))}
              style={{ padding: ".4rem .7rem", minHeight: 0 }}
            >
              הסר
            </button>
          </div>
        );
      })}
      <button
        className="btn"
        type="button"
        onClick={() => { clearAllVehicles(); setList([]); }}
        style={{ marginTop: ".3rem" }}
      >
        נקה את כל הרכבים השמורים
      </button>
    </>
  );
}
