# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



# Day 4: Immersive Ambient & Focus Experience 🎧✨

A lightweight, full-screen focus application built with React and Vanilla CSS. It provides immersive visual and audio environments to boost productivity, featuring seamless media playback, an auto-hiding UI, and persistent session tracking.

## 🚀 Features

* **6 Immersive Themes:** Switch between Maldives Sea, Hawaii, Antarctica, Christmas Snow, Scary Storm, and Halloween.
* **Zero-Buffering Playback:** Utilizes background preloading and graceful degradation (poster fallbacks) to ensure a seamless transition without black screens or loading spinners.
* **Idle Auto-Hide UI:** The interface and mouse cursor automatically fade out after 3 seconds of inactivity to eliminate distractions.
* **Multi-Layer Exit System:** Exit sessions naturally via the `ESC`/`F11` keys, a Glassmorphic on-screen button, or a mobile swipe-down gesture.
* **Time Tracking Dashboard:** Automatically calculates and formats the total focus time spent per theme, stored persistently in the browser.
* **Cross-Platform Responsive:** Optimized for both desktop environments and mobile touch screens.

## 🛠️ Tech Stack

* **Framework:** React (Vite)
* **Styling:** Pure Vanilla CSS (Custom properties, Glassmorphism, CSS Transitions)
* **State Management:** React Hooks (`useState`, `useEffect`, `useRef`, Custom Hooks)
* **Web APIs:** Fullscreen API, HTML5 Video/Audio API, LocalStorage API

## 📂 Folder Structure

## 📂 Folder Structure

```text
src/
├── assets/
├── components/
│   ├── Dashboard.jsx
│   ├── Session.jsx
│   └── ThemeCard.jsx
├── data/
│   └── themes.js
├── hooks/
│   └── useIdleTimer.js
├── utils/
│   ├── fullscreen.js
│   ├── mediaPreloader.js
│   └── storage.js
├── App.css
├── App.jsx
├── index.css
└── main.jsx# focus-session
