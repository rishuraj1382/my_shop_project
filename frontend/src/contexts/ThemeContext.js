// frontend/src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'themePreference'; // 'light' | 'dark' | 'system'

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(preference) {
  return preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference;
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
}

export const ThemeProvider = ({ children }) => {
  // The inline script in public/index.html already set data-theme before paint —
  // this just brings React's state in sync with what's already on the DOM/localStorage.
  const [preference, setPreferenceState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(preference));

  const setPreference = useCallback((next) => {
    setPreferenceState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Keep in sync with OS-level changes while preference === 'system'.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preference === 'system') {
        const resolved = resolveTheme('system');
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
