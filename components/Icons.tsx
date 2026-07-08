// Inline line icons (Lucide/Tabler style), 24×24, currentColor, decorative.
// Always aria-hidden — meaning is conveyed by adjacent text, never by icon/color
// alone (WCAG 1.4.1). className "ic" lets CSS size them per context.

type IconProps = { className?: string };

const svgProps = {
  className: "ic",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CheckIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l2.5 2.5L16 9" />
    </svg>
  );
}

export function AlertTriangleIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function InfoIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CarIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M5 11l1.5-4A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.4L19 11" />
      <path d="M3 11h18v5H3z" />
      <circle cx="7" cy="16.5" r="1.4" />
      <circle cx="17" cy="16.5" r="1.4" />
    </svg>
  );
}

export function CalendarPlusIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4M12 13v4M10 15h4" />
    </svg>
  );
}

export function BookmarkIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  );
}

export function SearchIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function ShieldIcon({ className = "ic" }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
