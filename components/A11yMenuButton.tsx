"use client";

/**
 * In-flow trigger that opens the accessibility menu (which lives in
 * AccessibilityMenu.tsx). Dispatches a window event the menu listens for — a
 * reliably-clickable alternative to the floating ♿ button.
 */
export function A11yMenuButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("ilcf:open-a11y"))}
    >
      {children}
    </button>
  );
}
