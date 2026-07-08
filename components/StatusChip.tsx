import type { ValidityLevel } from "@/lib/govData/types";
import { CheckIcon, ClockIcon, AlertTriangleIcon, InfoIcon } from "./Icons";

// Text + icon + colour — never colour alone (WCAG 1.4.1).
const MAP = {
  ok: { cls: "chip--ok", Icon: CheckIcon, text: "רישוי בתוקף" },
  soon: { cls: "chip--soon", Icon: ClockIcon, text: "לחידוש בקרוב" },
  expired: { cls: "chip--expired", Icon: AlertTriangleIcon, text: "רישוי פג תוקף" },
  unknown: { cls: "chip--unknown", Icon: InfoIcon, text: "רישוי לא זמין" },
} as const;

export function StatusChip({ level }: { level: ValidityLevel }) {
  const { cls, Icon, text } = MAP[level];
  return (
    <span className={`chip ${cls}`}>
      <Icon />
      <span>{text}</span>
    </span>
  );
}
