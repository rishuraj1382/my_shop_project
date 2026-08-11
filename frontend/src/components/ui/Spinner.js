// frontend/src/components/ui/Spinner.js
import React from 'react';

const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[3px]',
};

/**
 * Spinner — inherits color from its parent via `border-current`, so it works
 * unmodified inside any Button variant or text color context.
 * @param {'sm'|'md'|'lg'} [size]
 */
function Spinner({ size = 'sm', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-current border-t-transparent animate-spin-slow ${SIZE_MAP[size]} ${className}`}
    />
  );
}

export default Spinner;
