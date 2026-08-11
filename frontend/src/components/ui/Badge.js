// frontend/src/components/ui/Badge.js
import React from 'react';

const VARIANT_CLASSES = {
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  danger: 'bg-error-container text-on-error-container',
  info: 'bg-info-container text-on-info-container',
  warm: 'bg-tertiary-container text-on-tertiary-container',
  neutral: 'bg-surface-container-high text-on-surface-variant',
};

/**
 * Badge — status pill. Always renders visible text; never relies on color alone.
 * @param {'success'|'warning'|'danger'|'info'|'warm'|'neutral'} [variant]
 * @param {string} [icon] - material-symbols icon name
 * @param {boolean} [dot] - small solid dot, ignored if `icon` is given
 * @param {'sm'|'md'} [size]
 * @param {React.ReactNode} children - required, the visible label
 */
function Badge({ variant = 'neutral', icon, dot = false, size = 'md', className = '', children }) {
  const textSize = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${textSize} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-xs">{icon}</span>}
      {!icon && dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export default Badge;
