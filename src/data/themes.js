// src/data/themes.js

/**
 * Central registry of every ambient/focus theme.
 *
 * A theme drives four things from a single source of truth:
 *  - the ThemeCard preview (poster image, name, description)
 *  - the Session background (poster underneath a looping video)
 *  - the Session audio-track picker
 *  - the Dashboard lookup (matched by `id` against storage stats)
 *
 * To add a theme: drop its media into `public/public/media/<id>/` and add
 * an entry below. Nothing else in the app needs to change.
 *
 * Media is NOT bundled with this scaffold — point `posterUrl`,
 * `videoUrl`, and each `audioTracks[].src` at your own licensed
 * assets. Keep clips short, seamlessly loopable, and compressed:
 *   - video: 1080p or lower, H.264 mp4, ~10-30s loop, no audio track
 *   - audio: mp3/aac, seamlessly loopable, a few minutes is plenty
 *
 * @typedef {Object} AudioTrack
 * @property {string} id      Stable id, unique within the theme.
 * @property {string} label   Human label shown in the track picker.
 * @property {string} src     Path or URL to the audio file.
 *
 * @typedef {Object} Theme
 * @property {string} id                Stable id, unique across all themes. Doubles as the storage key.
 * @property {string} name              Display name shown on the ThemeCard.
 * @property {string} description       One-line mood description.
 * @property {string} posterUrl         Static image shown instantly, and permanently layered behind the video.
 * @property {string} videoUrl          Muted, looping background video.
 * @property {AudioTrack[]} audioTracks Selectable ambient soundtracks — the first is the default on session start.
 */

/** @type {Theme[]} */
export const THEMES = [
  {
    id: 'maldives-sea',
    name: 'Maldives Sea',
    description: 'Turquoise shallows and a quiet tropical horizon.',
    posterUrl: '/public/media/maldives-sea/poster.jpg',
    videoUrl: '/public/media/maldives-sea/loop.mp4',
    audioTracks: [
      { id: 'shoreline', label: 'Shoreline Lapping', src: '/public/media/maldives-sea/shoreline.mp3' },
      { id: 'deep-waves', label: 'Deep Ocean Waves', src: '/public/media/maldives-sea/deep-waves.mp3' },
    ],
  },
  {
    id: 'hawaii',
    name: 'Hawaii',
    description: 'Golden sunset light over a warm, rolling surf.',
    posterUrl: '/public/media/hawaii/poster.jpg',
    videoUrl: '/public/media/hawaii/loop.mp4',
    audioTracks: [
      { id: 'gentle-surf', label: 'Gentle Surf', src: '/public/media/hawaii/gentle-surf.mp3' },
      { id: 'ukulele', label: 'Acoustic Ukulele', src: '/public/media/hawaii/ukulele.mp3' },
    ],
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    description: 'A glacier blizzard under a pale, wind-scoured sky.',
    posterUrl: '/public/media/antarctica/poster.jpg',
    videoUrl: '/public/media/antarctica/loop.mp4',
    audioTracks: [
      { id: 'howling-wind', label: 'Howling Wind', src: '/public/media/antarctica/howling-wind.mp3' },
      { id: 'ice-crackle', label: 'Ice Crackling', src: '/public/media/antarctica/ice-crackle.mp3' },
    ],
  },
  {
    id: 'christmas-snow',
    name: 'Christmas Snow',
    description: 'Cozy snowfall outside a warmly lit window.',
    posterUrl: '/public/media/christmas-snow/poster.jpg',
    videoUrl: '/public/media/christmas-snow/loop.mp4',
    audioTracks: [
      { id: 'fireplace', label: 'Fireplace Crackle', src: '/public/media/christmas-snow/fireplace.mp3' },
      { id: 'festive-bells', label: 'Festive Bells', src: '/public/media/christmas-snow/festive-bells.mp3' },
    ],
  },
  {
    id: 'scary-storm',
    name: 'Scary Storm',
    description: 'Sheet lightning and heavy rain over a darkened coast.',
    posterUrl: '/public/media/scary-storm/poster.jpg',
    videoUrl: '/public/media/scary-storm/loop.mp4',
    audioTracks: [
      { id: 'heavy-rainfall', label: 'Heavy Rainfall', src: '/public/media/scary-storm/heavy-rainfall.mp3' },
      { id: 'distant-thunder', label: 'Distant Thunder', src: '/public/media/scary-storm/distant-thunder.mp3' },
    ],
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'A misty graveyard path under a low autumn moon.',
    posterUrl: '/public/media/halloween/poster.jpg',
    videoUrl: '/public/media/halloween/loop.mp4',
    audioTracks: [
      { id: 'eerie-breeze', label: 'Eerie Breeze', src: '/public/media/halloween/eerie-breeze.mp3' },
      { id: 'owl-hooting', label: 'Owl Hooting', src: '/public/media/halloween/owl-hooting.mp3' },
    ],
  },
];

/**
 * Looks up a theme by id. Returns `undefined` if not found — callers
 * (e.g. Session.jsx restoring from a stale reference) should handle that.
 * @param {string} id
 * @returns {Theme|undefined}
 */
export const getThemeById = (id) => THEMES.find((theme) => theme.id === id);