// frontend/src/components/ui/Button.js
import React from 'react';
import Spinner from './Spinner';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm shadow-primary/20 focus-visible:ring-primary/40',
  secondary: 'bg-secondary-container text-on-secondary-container hover:opacity-90 focus-visible:ring-secondary/40',
  ghost: 'bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary/40',
  danger: 'bg-error text-on-error hover:bg-error/90 focus-visible:ring-error/40',
};

const SIZE_CLASSES = {
  sm: 'py-2 px-4 text-xs',
  md: 'py-3 px-6 text-sm',
  lg: 'py-4 px-8 text-base',
};

/**
 * Button — token-driven primitive.
 * @param {'primary'|'secondary'|'ghost'|'danger'} [variant]
 * @param {'sm'|'md'|'lg'} [size]
 * @param {boolean} [loading] - forces disabled, shows a centered Spinner, sets aria-busy. Only
 *   meaningful when rendering as a real `<button>` — on `as={Link}`/anchor usage, `loading` still
 *   swaps the content for a Spinner but does not prevent navigation.
 * @param {boolean} [disabled] - same caveat as `loading` for non-button `as` values.
 * @param {string} [iconLeft] - material-symbols icon name
 * @param {string} [iconRight] - material-symbols icon name
 * @param {boolean} [fullWidth]
 * @param {React.ElementType} [as] - element/component to render as (default 'button'), e.g. `Link`
 */
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  as: Component = 'button',
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;
  const stateProps =
    Component === 'button'
      ? { type, disabled: isDisabled, 'aria-busy': loading || undefined }
      : { 'aria-disabled': isDisabled || undefined };

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold
        transition-all duration-200 ease-in-out active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...stateProps}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        <>
          {iconLeft && <span className="material-symbols-outlined text-lg">{iconLeft}</span>}
          {children}
          {iconRight && <span className="material-symbols-outlined text-lg">{iconRight}</span>}
        </>
      )}
    </Component>
  );
}

export default Button;
