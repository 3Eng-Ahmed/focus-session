// src/utils/storage.js

/**
 * Read/write layer for accumulated focus-session time.
 * Everything is namespaced under one localStorage key so the rest
 * of the app never touches `window.localStorage` directly.
 */

export const STORAGE_KEY = 'ambient_sessions_stats';

/**
 * @typedef {Object} ThemeStats
 * @property {number} totalSeconds       Cumulative seconds spent in this theme.
 * @property {number} sessionCount       Number of completed sessions (>0s).
 * @property {string|null} lastSessionAt ISO timestamp of the last session, or null.
 */

/** @returns {ThemeStats} */
const emptyThemeStats = () => ({
  totalSeconds: 0,
  sessionCount: 0,
  lastSessionAt: null,
});

/**
 * Feature-detects a usable localStorage. Guards against privacy/
 * incognito modes where `window.localStorage` exists but throws on
 * use, and against non-browser environments.
 * @returns {boolean}
 */
const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probeKey = '__ambient_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Returns the full stats map, keyed by theme id.
 * Never throws — missing or corrupted data resolves to `{}`.
 * @returns {Record<string, ThemeStats>}
 */
export const getAllStats = () => {
  if (!isStorageAvailable()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.warn('[storage] Could not read ambient session stats, ignoring corrupted data.', err);
    return {};
  }
};

/**
 * Returns stats for a single theme, defaulting to zeroed-out values
 * so callers never need to null-check the result.
 * @param {string} themeId
 * @returns {ThemeStats}
 */
export const getThemeStats = (themeId) => {
  const all = getAllStats();
  return { ...emptyThemeStats(), ...(all[themeId] || {}) };
};

/**
 * Adds elapsed seconds from a just-finished session onto a theme's
 * running total and persists it. Call this once when a session ends
 * (manual exit, ESC/F11, swipe-down, or unmount) — never per-tick.
 * @param {string} themeId
 * @param {number} seconds  Elapsed seconds for the session that just ended.
 * @returns {ThemeStats} the theme's updated, persisted stats.
 */
export const recordSessionTime = (themeId, seconds) => {
  const delta = Math.max(0, Math.floor(Number(seconds) || 0));
  const all = getAllStats();
  const previous = { ...emptyThemeStats(), ...(all[themeId] || {}) };

  const updated = {
    totalSeconds: previous.totalSeconds + delta,
    sessionCount: previous.sessionCount + (delta > 0 ? 1 : 0),
    lastSessionAt: delta > 0 ? new Date().toISOString() : previous.lastSessionAt,
  };

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [themeId]: updated }));
    } catch (err) {
      console.warn('[storage] Could not persist ambient session stats.', err);
    }
  }

  return updated;
};

/**
 * Wipes every theme's stats. Intended for an optional "Reset stats" control.
 */
export const clearAllStats = () => {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[storage] Could not clear ambient session stats.', err);
  }
};

/**
 * Formats a duration in seconds as a compact, human-readable string.
 *   40    -> "40s"
 *   90    -> "1m 30s"
 *   720   -> "12m"
 *   3600  -> "1h"
 *   4800  -> "1h 20m"
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatDuration = (totalSeconds) => {
  const total = Math.max(0, Math.floor(Number(totalSeconds) || 0));

  if (total < 60) return `${total}s`;

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};