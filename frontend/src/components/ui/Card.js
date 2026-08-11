// frontend/src/components/ui/Card.js
import React from 'react';

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card — token-driven surface container.
 * @param {'none'|'sm'|'md'|'lg'} [padding]
 * @param {boolean} [interactive] - adds hover-lift visuals; if `onClick` is also given,
 *   makes the card keyboard-operable (role="button", Enter/Space). If wrapped by a <Link>
 *   instead, pass `interactive` without `onClick` for hover visuals only (avoids double
 *   interactive semantics with the parent anchor).
 * @param {function} [onClick]
 * @param {string} [as] - element/component to render as (default 'div')
 */
function Card({
  padding = 'md',
  interactive = false,
  onClick,
  as: Component = 'div',
  className = '',
  children,
  ...rest
}) {
  const isKeyboardOperable = interactive && !!onClick;

  const handleKeyDown = (e) => {
    if (!isKeyboardOperable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      onClick(e);
    }
  };

  return (
    <Component
      className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/10
        ${interactive ? 'hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${isKeyboardOperable ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface' : ''}
        ${PADDING_CLASSES[padding]} ${className}`}
      onClick={onClick}
      onKeyDown={isKeyboardOperable ? handleKeyDown : undefined}
      role={isKeyboardOperable ? 'button' : undefined}
      tabIndex={isKeyboardOperable ? 0 : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Card;
