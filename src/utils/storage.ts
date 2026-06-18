import type { AppConfig, DailyEntry } from '../types';
import { getTodayStr } from './dateUtils';

const STORAGE_KEY = 'yo-vs-mejor-version-v1';

export interface StoredData {
  config: AppConfig | null;
  entries: DailyEntry[];
  lastVisit: string;
}

const DEFAULT_DATA: StoredData = {
  config: null,
  entries: [],
  lastVisit: getTodayStr(),
};

/**
 * Loads all stored data from localStorage. Returns default structure if nothing found.
 */
export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    return {
      config: parsed.config ?? null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      lastVisit: parsed.lastVisit ?? getTodayStr(),
    };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

/**
 * Persists the full data object to localStorage.
 */
export function saveData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be full or unavailable — fail silently
  }
}

/**
 * Clears all stored data.
 */
export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}

/**
 * Retrieves a single entry by date string ('YYYY-MM-DD'), or null if not found.
 */
export function getEntry(date: string): DailyEntry | null {
  const data = loadData();
  return data.entries.find((e) => e.date === date) ?? null;
}

/**
 * Saves (or updates) a single DailyEntry in localStorage.
 */
export function saveEntry(entry: DailyEntry): void {
  const data = loadData();
  const idx = data.entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    data.entries[idx] = entry;
  } else {
    data.entries.push(entry);
  }
  saveData(data);
}

/**
 * Retrieves the stored AppConfig, or null if not yet set up.
 */
export function getConfig(): AppConfig | null {
  const data = loadData();
  return data.config;
}

/**
 * Saves the AppConfig to localStorage.
 */
export function saveConfig(config: AppConfig): void {
  const data = loadData();
  data.config = config;
  saveData(data);
}
