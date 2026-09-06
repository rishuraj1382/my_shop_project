// frontend/src/components/ui/ThemeToggle.js
import React from 'react';
import Dropdown from './Dropdown';
import { useTheme } from '../../contexts/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'computer' },
];

/**
 * ThemeToggle — light/dark/system picker, uses the shared Dropdown primitive.
 * Trigger icon reflects the resolved theme (not just the preference), so a
 * "system" user still sees an accurate sun/moon glyph at a glance.
 */
function ThemeToggle() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const triggerIcon = resolvedTheme === 'dark' ? 'dark_mode' : 'light_mode';

  return (
    <Dropdown
      align="right"
      trigger={({ open, toggle }) => (
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label={`Theme: ${preference}. Change theme`}
          aria-haspopup="true"
          aria-expanded={open}
        >
          <span className="material-symbols-outlined text-2xl">{triggerIcon}</span>
        </button>
      )}
    >
      {({ close }) => (
        <div className="w-40 p-1.5" role="menu">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="menuitemradio"
              aria-checked={preference === opt.value}
              onClick={() => { setPreference(opt.value); close(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                preference === opt.value
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{opt.icon}</span>
              {opt.label}
              {preference === opt.value && (
                <span className="material-symbols-outlined text-sm ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}

export default ThemeToggle;
