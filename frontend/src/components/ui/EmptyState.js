// frontend/src/components/ui/EmptyState.js
import React from 'react';
import Button from './Button';

/**
 * EmptyState — icon + title + description + optional action, extracted from the
 * pattern already duplicated near-identically across several pages.
 * @param {string} icon - material-symbols icon name
 * @param {string} title
 * @param {string} [description]
 * @param {{label: string, onClick: function}} [action] - renders a Button internally
 * @param {React.ReactNode} [children] - fallback slot for a custom CTA (e.g. a <Link>)
 *   instead of a plain action button
 */
function EmptyState({ icon, title, description, action, children, className = '' }) {
  return (
    <div className={`text-center py-16 sm:py-24 animate-fade-in ${className}`}>
      <span className="material-symbols-outlined text-6xl text-outline/30">{icon}</span>
      <p className="text-on-surface-variant text-lg font-medium mt-4">{title}</p>
      {description && <p className="text-outline text-sm mt-1">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
