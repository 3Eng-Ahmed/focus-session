// src/hooks/useIdleTimer.js
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Events that count as "activity" and revive the UI from idle.
 * Per spec: mouse movement and screen touches. `touchmove` is
 * included alongside `touchstart` so a slow, continuous drag on
 * mobile doesn't go idle mid-gesture just because the initiating
 * `touchstart` happened more than `timeoutMs` ago.
 */
const DEFAULT_ACTIVITY_EVENTS = ['mousemove', 'touchstart', 'touchmove'];
const DEFAULT_TIMEOUT_MS = 3000;

/**
 * Tracks pointer/touch activity and flips to "idle" after a period of
 * no activity. Session.jsx uses `isIdle` to hide the cursor and fade
 * out its overlay UI (timer, exit button).
 *
 * @param {number} [timeoutMs=3000]  Milliseconds of inactivity before idle.
 * @param {string[]} [activityEvents]  Window events treated as "activity".
 *   For best performance, pass a stable (module-level or memoized) array
 *   if you override the default — a fresh array literal on every render
 *   still works correctly, it just causes an avoidable re-subscription.
 * @returns {{ isIdle: boolean, reset: () => void }}
 */
export default function useIdleTimer(timeoutMs = DEFAULT_TIMEOUT_MS, activityEvents = DEFAULT_ACTIVITY_EVENTS) {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef(null);

  const clearPendingIdle = useCallback(() => {
    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  /** Marks the UI active right now, and re-arms the idle countdown. */
  const reset = useCallback(() => {
    clearPendingIdle();
    setIsIdle(false);
    idleTimeoutRef.current = window.setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs, clearPendingIdle]);

  useEffect(() => {
    reset(); // arm the initial countdown as soon as the consumer mounts

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, reset, { passive: true });
    });

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, reset);
      });
      clearPendingIdle();
    };
  }, [reset, activityEvents, clearPendingIdle]);

  return { isIdle, reset };
}