// src/components/ThemeCard.jsx
import { preloadTheme } from '../utils/mediaPreloader';

/**
 * A selectable theme preview. Hovering (or focusing via keyboard, or
 * touching, for non-mouse input) warms the browser cache for that
 * theme's video and audio so the Session view can start playback with
 * no buffering gap.
 *
 * @param {Object} props
 * @param {import('../data/themes').Theme} props.theme
 * @param {(theme: import('../data/themes').Theme) => void} props.onSelect
 */
export default function ThemeCard({ theme, onSelect }) {
  const handlePreload = () => preloadTheme(theme);

  return (
    <button
      type="button"
      className="theme-card"
      style={{ '--theme-poster': `url(${theme.posterUrl})` }}
      onMouseEnter={handlePreload}
      onFocus={handlePreload}
      onTouchStart={handlePreload}
      onClick={() => onSelect(theme)}
      aria-label={`Start a focus session with ${theme.name}: ${theme.description}`}
    >
      <span className="theme-card__poster" aria-hidden="true" />
      <span className="theme-card__scrim" aria-hidden="true" />
      <span className="theme-card__content">
        <span className="theme-card__name">{theme.name}</span>
        <span className="theme-card__description">{theme.description}</span>
      </span>
    </button>
  );
}