// localStorage persistence — saved cars stay on the user's device only.

export interface SavedVehicle {
  plate: string;
  nickname: string;
  licenceExpiry?: string;
  savedAt: string;
}

export interface Prefs {
  reminderDaysBefore: number;
}

const CARS_KEY = "ilcf:savedVehicles";
const PREFS_KEY = "ilcf:prefs";

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export function getSavedVehicles(): SavedVehicle[] {
  if (typeof localStorage === "undefined") return [];
  return safeParse<SavedVehicle[]>(localStorage.getItem(CARS_KEY), []);
}

export function isSaved(plate: string): boolean {
  return getSavedVehicles().some((v) => v.plate === plate);
}

export function saveVehicle(v: SavedVehicle): SavedVehicle[] {
  const list = getSavedVehicles().filter((x) => x.plate !== v.plate);
  list.unshift(v);
  localStorage.setItem(CARS_KEY, JSON.stringify(list));
  return list;
}

export function removeVehicle(plate: string): SavedVehicle[] {
  const list = getSavedVehicles().filter((x) => x.plate !== plate);
  localStorage.setItem(CARS_KEY, JSON.stringify(list));
  return list;
}

export function clearAllVehicles(): void {
  localStorage.removeItem(CARS_KEY);
}

export function getPrefs(): Prefs {
  if (typeof localStorage === "undefined") return { reminderDaysBefore: 30 };
  return safeParse<Prefs>(localStorage.getItem(PREFS_KEY), { reminderDaysBefore: 30 });
}

export function setPrefs(p: Prefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}
