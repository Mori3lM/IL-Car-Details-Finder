"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AccessibilityIcon,
  PlusIcon,
  MinusIcon,
  CloseIcon,
} from "./Icons";
import {
  applyA11y,
  getA11ySnapshot,
  getA11yServerSnapshot,
  setA11y,
  subscribeA11y,
  DEFAULT_A11Y,
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
  FONT_SCALE_STEP,
  type A11ySettings,
  type A11yTheme,
} from "@/lib/a11y";

const THEMES: { value: A11yTheme; label: string }[] = [
  { value: "auto", label: "אוטומטי" },
  { value: "light", label: "בהיר" },
  { value: "dark", label: "כהה" },
  { value: "high-contrast", label: "ניגודיות גבוהה" },
];

const round = (n: number) => Math.round(n * 100) / 100;

export function AccessibilityMenu() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  const settings = useSyncExternalStore(
    subscribeA11y,
    getA11ySnapshot,
    getA11yServerSnapshot,
  );

  // Apply persisted settings to <html> (DOM write, not React state).
  useEffect(() => {
    applyA11y(settings);
  }, [settings]);

  // Native <dialog> handles focus-trap + Esc; return focus to the button on close.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => fabRef.current?.focus();
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  // Base mutations on the LATEST persisted snapshot (not the render closure), so
  // rapid successive changes never overwrite each other with stale values.
  const update = (patch: Partial<A11ySettings>) =>
    setA11y({ ...getA11ySnapshot(), ...patch });

  const setFont = (delta: number) => {
    const current = getA11ySnapshot().fontScale;
    update({
      fontScale: Math.min(
        FONT_SCALE_MAX,
        Math.max(FONT_SCALE_MIN, round(current + delta)),
      ),
    });
  };

  const percent = Math.round(settings.fontScale * 100);

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className="a11y-fab"
        aria-label="תפריט נגישות"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <AccessibilityIcon />
      </button>

      <dialog
        ref={dialogRef}
        className="a11y-dialog"
        aria-labelledby="a11y-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="a11y-dialog__head">
          <h2 id="a11y-title">תפריט נגישות</h2>
          <button
            type="button"
            className="a11y-btn a11y-iconbtn"
            aria-label="סגירת תפריט הנגישות"
            onClick={() => dialogRef.current?.close()}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="a11y-dialog__body">
          {/* Font size */}
          <div className="a11y-group">
            <span className="a11y-group__label" id="a11y-font">
              גודל טקסט
            </span>
            <div className="a11y-row a11y-fontsize" aria-labelledby="a11y-font">
              <button
                type="button"
                className="a11y-btn a11y-iconbtn"
                aria-label="הקטנת גודל הטקסט"
                onClick={() => setFont(-FONT_SCALE_STEP)}
                disabled={settings.fontScale <= FONT_SCALE_MIN}
              >
                <MinusIcon />
              </button>
              <output aria-live="polite">{percent}%</output>
              <button
                type="button"
                className="a11y-btn a11y-iconbtn"
                aria-label="הגדלת גודל הטקסט"
                onClick={() => setFont(FONT_SCALE_STEP)}
                disabled={settings.fontScale >= FONT_SCALE_MAX}
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="a11y-group">
            <span className="a11y-group__label" id="a11y-theme">
              ערכת צבעים
            </span>
            <div className="a11y-row" role="group" aria-labelledby="a11y-theme">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className="a11y-btn a11y-btn--grow"
                  aria-pressed={settings.theme === t.value}
                  onClick={() => update({ theme: t.value })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="a11y-group">
            <span className="a11y-group__label">התאמות תצוגה</span>
            <div className="a11y-row">
              <button
                type="button"
                className="a11y-btn a11y-btn--grow"
                aria-pressed={settings.highlightLinks}
                onClick={() => update({ highlightLinks: !settings.highlightLinks })}
              >
                הדגשת קישורים
              </button>
              <button
                type="button"
                className="a11y-btn a11y-btn--grow"
                aria-pressed={settings.readableFont}
                onClick={() => update({ readableFont: !settings.readableFont })}
              >
                גופן קריא
              </button>
              <button
                type="button"
                className="a11y-btn a11y-btn--grow"
                aria-pressed={settings.stopAnimations}
                onClick={() => update({ stopAnimations: !settings.stopAnimations })}
              >
                עצירת אנימציות
              </button>
            </div>
          </div>
        </div>

        <div className="a11y-dialog__foot">
          <button
            type="button"
            className="a11y-btn"
            onClick={() => setA11y(DEFAULT_A11Y)}
          >
            איפוס הגדרות
          </button>
          <Link
            className="a11y-btn"
            href="/accessibility"
            onClick={() => dialogRef.current?.close()}
          >
            להצהרת הנגישות
          </Link>
        </div>
      </dialog>
    </>
  );
}
