// frontend/src/components/ui/Skeleton.js
import React from 'react';

const ROUNDED_MAP = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * Skeleton — thin wrapper around the existing `.skeleton` shimmer CSS class.
 * @param {string|number} [width]
 * @param {string|number} [height]
 * @param {'md'|'lg'|'xl'|'2xl'|'full'} [rounded]
 */
function Skeleton({ width, height, rounded = 'xl', className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${ROUNDED_MAP[rounded]} ${className}`}
      style={{ width, height, ...style }}
    />
  );
}

export default Skeleton;
