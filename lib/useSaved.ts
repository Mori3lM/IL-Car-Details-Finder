// React hooks over the localStorage store, via useSyncExternalStore. This is the
// idiomatic way to read an external store: a stable server snapshot (empty)
// avoids hydration mismatch, and same-tab/cross-tab changes re-render reactively.

import { useSyncExternalStore } from "react";
import {
  getPrefs,
  getSavedVehiclesSnapshot,
  subscribeToStorage,
  type SavedVehicle,
} from "@/lib/storage";

const EMPTY: SavedVehicle[] = [];
const serverSnapshot = (): SavedVehicle[] => EMPTY;

export function useSavedVehicles(): SavedVehicle[] {
  return useSyncExternalStore(
    subscribeToStorage,
    getSavedVehiclesSnapshot,
    serverSnapshot,
  );
}

export function useIsSaved(plate: string): boolean {
  return useSavedVehicles().some((v) => v.plate === plate);
}

const DEFAULT_REMINDER_DAYS = 30;

/** Reminder lead-time (days). A number primitive → stable snapshot. */
export function useReminderDays(): number {
  return useSyncExternalStore(
    subscribeToStorage,
    () => getPrefs().reminderDaysBefore,
    () => DEFAULT_REMINDER_DAYS,
  );
}
