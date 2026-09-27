// src/utils/mediaPreloader.js

/**
 * Lightweight, dependency-free media preloader.
 *
 * ThemeCard calls `preloadTheme(theme)` on hover/focus/touch so that,
 * by the time the user actually enters a Session, the browser already
 * has the video and audio warmed in its HTTP cache — Session.jsx's own
 * <video>/<audio> elements then start from cache instead of a cold
 * network fetch.
 *
 * Each URL is only ever requested once per page load (tracked in
 * `preloadedUrls`), so re-hovering the same card is a no-op.
 */

const preloadedUrls = new Set();

// A single off-screen container that holds preloading <video> elements.
// Kept in the DOM (not just detached JS objects) because some browsers,
// notably mobile Safari, are unreliable about buffering video that was
// never attached to the document.
let videoPreloadContainer = null;

const getVideoPreloadContainer = () => {
  if (videoPreloadContainer) return videoPreloadContainer;
  if (typeof document === 'undefined') return null;

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.width = '0';
  container.style.height = '0';
  container.style.overflow = 'hidden';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  videoPreloadContainer = container;
  return container;
};

/**
 * Warms the browser cache for a video URL without playing or showing it.
 * @param {string} url
 */
export const preloadVideo = (url) => {
  if (!url || preloadedUrls.has(url)) return;
  const container = getVideoPreloadContainer();
  if (!container) return;

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;
  video.load();

  container.appendChild(video);
  preloadedUrls.add(url);
};

/**
 * Warms the browser cache for an audio URL.
 * @param {string} url
 */
export const preloadAudio = (url) => {
  if (!url || preloadedUrls.has(url)) return;
  if (typeof Audio === 'undefined') return;

  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = url;
  audio.load();

  preloadedUrls.add(url);
};

/**
 * Preloads everything a theme needs: its background video and every
 * selectable audio track (not just the default one, since the user
 * may switch tracks mid-session).
 * @param {import('../data/themes').Theme} theme
 */
export const preloadTheme = (theme) => {
  if (!theme) return;
  preloadVideo(theme.videoUrl);
  theme.audioTracks?.forEach((track) => preloadAudio(track.src));
};