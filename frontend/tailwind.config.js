/** @type {import('tailwindcss').Config} */
module.exports = {
  // Attribute-based dark mode: <html data-theme="dark">, driven by ThemeContext.
  // Kept as a selector strategy (not 'media') so the user's explicit choice always wins,
  // with system-preference resolved to an explicit value in JS before paint (see index.html).
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // All colors resolve through CSS custom properties (defined per-theme in index.css)
        // using the RGB-triplet + <alpha-value> pattern, so every existing utility class
        // (bg-primary, text-on-surface, border-outline-variant/20, ...) is dark-mode-aware
        // automatically — no component ever needs a `dark:` variant for color alone.
        "primary": "rgb(var(--color-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-container) / <alpha-value>)",

        "secondary": "rgb(var(--color-secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--color-on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--color-secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--color-on-secondary-container) / <alpha-value>)",

        "tertiary": "rgb(var(--color-tertiary) / <alpha-value>)",
        "on-tertiary": "rgb(var(--color-on-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--color-tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--color-on-tertiary-container) / <alpha-value>)",

        "error": "rgb(var(--color-error) / <alpha-value>)",
        "on-error": "rgb(var(--color-on-error) / <alpha-value>)",
        "error-container": "rgb(var(--color-error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--color-on-error-container) / <alpha-value>)",

        "success": "rgb(var(--color-success) / <alpha-value>)",
        "on-success": "rgb(var(--color-on-success) / <alpha-value>)",
        "success-container": "rgb(var(--color-success-container) / <alpha-value>)",
        "on-success-container": "rgb(var(--color-on-success-container) / <alpha-value>)",

        "warning": "rgb(var(--color-warning) / <alpha-value>)",
        "on-warning": "rgb(var(--color-on-warning) / <alpha-value>)",
        "warning-container": "rgb(var(--color-warning-container) / <alpha-value>)",
        "on-warning-container": "rgb(var(--color-on-warning-container) / <alpha-value>)",

        "info": "rgb(var(--color-info) / <alpha-value>)",
        "on-info": "rgb(var(--color-on-info) / <alpha-value>)",
        "info-container": "rgb(var(--color-info-container) / <alpha-value>)",
        "on-info-container": "rgb(var(--color-on-info-container) / <alpha-value>)",

        "background": "rgb(var(--color-background) / <alpha-value>)",
        "surface": "rgb(var(--color-surface) / <alpha-value>)",
        "surface-bright": "rgb(var(--color-surface-bright) / <alpha-value>)",
        "surface-dim": "rgb(var(--color-surface-dim) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--color-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--color-surface-container-low) / <alpha-value>)",
        "surface-container": "rgb(var(--color-surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--color-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--color-surface-container-highest) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--color-on-surface-variant) / <alpha-value>)",
        "outline": "rgb(var(--color-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--color-outline-variant) / <alpha-value>)",
      },
      fontFamily: {
        "headline": ["'Plus Jakarta Sans'", "sans-serif"],
        "body": ["'Inter'", "sans-serif"],
        "label": ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.4s ease-out both',
        'slide-down': 'slideDown 0.3s ease-out both',
        'scale-in': 'scaleIn 0.3s ease-out both',
        'spin-slow': 'spin 1.2s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'toast-in': 'toastIn 0.35s ease-out both',
        'toast-out': 'toastOut 0.3s ease-in both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(60px)' },
        },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
