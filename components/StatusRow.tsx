import type { ValidityStatus } from "@/lib/govData/types";
import { formatIsoDate, formatDaysRemaining } from "@/lib/format";
import { CheckIcon, ClockIcon, AlertTriangleIcon, InfoIcon } from "./Icons";

// Status is conveyed by TEXT + ICON + shape — never colour alone (WCAG 1.4.1).
const LEVEL = {
  ok: { cls: "status--ok", Icon: CheckIcon },
  soon: { cls: "status--soon", Icon: ClockIcon },
  expired: { cls: "status--expired", Icon: AlertTriangleIcon },
  unknown: { cls: "status--unknown", Icon: InfoIcon },
} as const;

/** A single licence/test status row (the most prominent element on the page). */
export function StatusRow({ status }: { status: ValidityStatus }) {
  const { cls, Icon } = LEVEL[status.level];
  const dateText = status.date ? ` · עד ${formatIsoDate(status.date)}` : "";
  const daysText = formatDaysRemaining(status.daysRemaining);

  return (
    <div className={`status ${cls}`}>
      <Icon />
      <span>
        {status.label}
        {dateText}
      </span>
      {daysText && <span className="status__days">{daysText}</span>}
    </div>
  );
}
