// src/App.jsx
import { useState } from 'react';
import { THEMES } from './data/themes';
import ThemeCard from './components/ThemeCard';
import Dashboard from './components/Dashboard';
import Session from './components/Session';
import './App.css';

export default function App() {
  const [activeTheme, setActiveTheme] = useState(null);

  if (activeTheme) {
    return <Session theme={activeTheme} onExit={() => setActiveTheme(null)} />;
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Focus</h1>
        <p className="app__subtitle">Pick a scene, and disappear into it for a while.</p>
      </header>

      <section className="app__grid" aria-label="Available themes">
        {THEMES.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} onSelect={setActiveTheme} />
        ))}
      </section>

      <Dashboard />
    </main>
  );
}