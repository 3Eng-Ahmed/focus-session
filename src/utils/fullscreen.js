// src/utils/fullscreen.js

/**
 * Cross-browser Fullscreen API helpers. Wraps vendor-prefixed method
 * names (older WebKit/Edge) and normalizes both promise-based and
 * synchronous implementations behind one safe interface.
 */

const FULLSCREEN_CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'];

/** @returns {boolean} Whether any element is currently fullscreen. */
export const isFullscreenActive = () =>
  Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

/**
 * Requests fullscreen on `element` (defaults to the whole document).
 * Must be called as a direct result of a user gesture in most browsers.
 * @param {Element} [element]
 */
export const requestFullscreen = (element) => {
  const target = element || document.documentElement;
  const requestFn =
    target.requestFullscreen?.bind(target) ||
    target.webkitRequestFullscreen?.bind(target) ||
    target.msRequestFullscreen?.bind(target);

  if (!requestFn) return;

  try {
    const result = requestFn();
    result?.catch?.((err) => console.warn('[fullscreen] Could not enter fullscreen.', err));
  } catch (err) {
    console.warn('[fullscreen] Could not enter fullscreen.', err);
  }
};

/** Exits fullscreen if currently active. Safe to call when it isn't. */
export const exitFullscreen = () => {
  if (!isFullscreenActive()) return;

  const exitFn =
    document.exitFullscreen?.bind(document) ||
    document.webkitExitFullscreen?.bind(document) ||
    document.msExitFullscreen?.bind(document);

  if (!exitFn) return;

  try {
    const result = exitFn();
    result?.catch?.(() => {
      /* Already leaving fullscreen (e.g. the browser's own Escape handling beat us to it) — ignore. */
    });
  } catch {
    /* Some vendor-prefixed implementations throw synchronously instead of rejecting. */
  }
};

/**
 * Subscribes to fullscreen-change across vendor-prefixed event names.
 * @param {() => void} callback
 * @returns {() => void} unsubscribe function
 */
export const onFullscreenChange = (callback) => {
  FULLSCREEN_CHANGE_EVENTS.forEach((eventName) => document.addEventListener(eventName, callback));
  return () => {
    FULLSCREEN_CHANGE_EVENTS.forEach((eventName) => document.removeEventListener(eventName, callback));
  };
};