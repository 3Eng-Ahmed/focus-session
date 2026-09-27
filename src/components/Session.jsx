// src/components/Session.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { recordSessionTime } from '../utils/storage';
import { requestFullscreen, exitFullscreen, isFullscreenActive, onFullscreenChange } from '../utils/fullscreen';
import useIdleTimer from '../hooks/useIdleTimer';

const AUDIO_FADE_MS = 300;
const SWIPE_EXIT_MIN_DISTANCE = 80; // px of downward travel to count as an exit swipe
const SWIPE_EXIT_MAX_DURATION = 800; // ms — keeps a slow drag from triggering an exit

/**
 * Linearly ramps an <audio> element's volume over `durationMs`, then calls
 * `onComplete`. Returns a cancel function, so an in-flight fade can be
 * aborted if another track change starts or the component unmounts.
 */
const fadeAudioVolume = (audioEl, from, to, durationMs, onComplete) => {
  const STEPS = 12;
  const stepMs = durationMs / STEPS;
  let currentStep = 0;
  audioEl.volume = from;

  const intervalId = window.setInterval(() => {
    currentStep += 1;
    audioEl.volume = from + (to - from) * (currentStep / STEPS);
    if (currentStep >= STEPS) {
      window.clearInterval(intervalId);
      audioEl.volume = to;
      onComplete?.();
    }
  }, stepMs);

  return () => window.clearInterval(intervalId);
};

const formatElapsedTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Full-screen ambient/focus session for a single theme: background video
 * over its poster, a selectable ambient audio track, an ascending timer,
 * an idle-fading overlay, and three independent ways to exit.
 *
 * @param {Object} props
 * @param {import('../data/themes').Theme} props.theme
 * @param {() => void} props.onExit  Called exactly once, after cleanup, when the session ends.
 */
export default function Session({ theme, onExit }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const exitButtonRef = useRef(null);

  const elapsedSecondsRef = useRef(0);
  const hasExitedRef = useRef(false);
  const onExitRef = useRef(onExit);
  const touchStartYRef = useRef(null);
  const touchStartTimeRef = useRef(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState(() => theme.audioTracks[0]?.id ?? null);

  const { isIdle } = useIdleTimer(3000);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  // The single exit path every trigger (button, keys, swipe, fullscreen
  // drop-out, unmount) funnels into. Guarded so it only ever runs once.
  const performExit = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;

    videoRef.current?.pause();
    audioRef.current?.pause();
    exitFullscreen();
    recordSessionTime(theme.id, elapsedSecondsRef.current);
    onExitRef.current?.();
  }, [theme.id]);

  // Mirrors the latest performExit into a ref so the unmount-only safety
  // net below can call it without listing it as a dependency (which would
  // re-fire that effect's cleanup on every render instead of only on unmount).
  const performExitRef = useRef(performExit);
  useEffect(() => {
    performExitRef.current = performExit;
  }, [performExit]);

  // Enter fullscreen and move focus to the primary escape hatch.
  useEffect(() => {
    requestFullscreen(document.documentElement);
    exitButtonRef.current?.focus();
  }, []);

  // If fullscreen ends for any reason we didn't initiate ourselves — the
  // browser's own Escape handling, an OS-level gesture, a device rotation
  // that drops fullscreen — treat it as an exit so the app state stays in sync.
  useEffect(
    () =>
      onFullscreenChange(() => {
        if (!isFullscreenActive()) performExit();
      }),
    [performExit]
  );

  // Desktop keybindings. Note on F11: browsers reserve it for their own
  // chrome-level fullscreen toggle, so page JS can't reliably suppress the
  // browser's native behavior — but this still guarantees our own media,
  // timer, and view state exit cleanly no matter what the browser does.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.key === 'F11') {
        event.preventDefault();
        performExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performExit]);

  // Ascending timer. Runs continuously regardless of idle state — going
  // idle hides chrome, it doesn't pause the session.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      elapsedSecondsRef.current += 1;
      setElapsedSeconds(elapsedSecondsRef.current);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Muted video autoplay is universally permitted, but the promise is
  // still guarded for older browsers that reject unexpectedly.
  useEffect(() => {
    const playPromise = videoRef.current?.play();
    playPromise?.catch?.((err) => console.warn('[session] Video autoplay was blocked.', err));
  }, []);

  // Cross-fades the ambient audio whenever the active track changes —
  // including the initial mount, which fades in from silence rather than
  // popping in at full volume.
  useEffect(() => {
    const audioEl = audioRef.current;
    const track = theme.audioTracks.find((candidate) => candidate.id === activeTrackId);
    if (!audioEl || !track) return undefined;

    let cancelled = false;
    const cancelFadeOut = fadeAudioVolume(audioEl, audioEl.volume, 0, AUDIO_FADE_MS, () => {
      if (cancelled) return;
      audioEl.src = track.src;
      audioEl.currentTime = 0;
      const playPromise = audioEl.play();
      playPromise?.catch?.((err) => console.warn('[session] Audio autoplay was blocked.', err));
      fadeAudioVolume(audioEl, 0, 1, AUDIO_FADE_MS);
    });

    return () => {
      cancelled = true;
      cancelFadeOut();
    };
  }, [activeTrackId, theme.audioTracks]);

  // Safety net: however this component goes away, the session gets
  // recorded and cleaned up exactly once (performExit's own guard
  // makes this a no-op if one of the explicit exits already ran).
  useEffect(() => () => performExitRef.current(), []);

  const handleTouchStart = (event) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (event) => {
    const startY = touchStartYRef.current;
    const startTime = touchStartTimeRef.current;
    touchStartYRef.current = null;
    if (startY === null) return;

    const endY = event.changedTouches[0]?.clientY ?? startY;
    const deltaY = endY - startY;
    const elapsedMs = Date.now() - (startTime ?? Date.now());

    if (deltaY > SWIPE_EXIT_MIN_DISTANCE && elapsedMs < SWIPE_EXIT_MAX_DURATION) {
      performExit();
    }
  };

  if (!theme) return null;

  const hasMultipleTracks = theme.audioTracks.length > 1;

  return (
    <div
      className={`session${isIdle ? ' session--idle' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="session__poster" style={{ backgroundImage: `url(${theme.posterUrl})` }} aria-hidden="true" />

      {!videoFailed && (
        <video
          ref={videoRef}
          className={`session__video${videoReady ? ' session__video--ready' : ''}`}
          src={theme.videoUrl}
          poster={theme.posterUrl}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <div className="session__scrim" aria-hidden="true" />

      {/* Persistent element; `src` is swapped imperatively above so track
          changes can cross-fade instead of jump-cutting. */}
      <audio ref={audioRef} loop />

      <div className="session__overlay">
        <button ref={exitButtonRef} type="button" className="session__exit-button" onClick={performExit}>
          <svg className="session__exit-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Exit Session</span>
        </button>

        <div className="session__timer" role="timer" aria-live="off" aria-label="Session duration">
          {formatElapsedTime(elapsedSeconds)}
        </div>

        <div className="session__theme-label">{theme.name}</div>

        {hasMultipleTracks && (
          <div className="session__audio-tracks" role="group" aria-label="Ambient sound">
            {theme.audioTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`session__audio-track${track.id === activeTrackId ? ' session__audio-track--active' : ''}`}
                onClick={() => setActiveTrackId(track.id)}
                aria-pressed={track.id === activeTrackId}
              >
                {track.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}