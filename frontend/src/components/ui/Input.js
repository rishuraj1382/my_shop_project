// frontend/src/components/ui/Input.js
import React, { useId } from 'react';

/**
 * Input — labeled text input with accessible id/label association and error state.
 * @param {string} label - required unless labelHidden
 * @param {boolean} [labelHidden]
 * @param {string} [id] - auto-generated via useId() if omitted
 * @param {string} [error] - error message; sets aria-invalid + aria-describedby
 * @param {string} [helperText]
 * @param {boolean} [required]
 * @param {string} [iconLeft] - material-symbols icon name
 * @param {React.ReactNode} [rightElement] - rendered inside the input's own relative
 *   wrapper (not the outer label wrapper), so it's vertically centered against the
 *   input field itself regardless of whether a label is shown above it.
 */
function Input({
  label,
  labelHidden = false,
  id,
  error,
  helperText,
  required = false,
  iconLeft,
  rightElement,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className={`label-stitch ${labelHidden ? 'sr-only' : ''}`}>
          {label}{required && <span className="text-error"> *</span>}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`input-stitch ${iconLeft ? 'pl-10' : ''} ${rightElement ? 'pr-10' : ''} ${error ? 'ring-2 ring-error/40' : ''} ${className}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error mt-1.5 ml-1">{error}</p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-on-surface-variant mt-1.5 ml-1">{helperText}</p>
      )}
    </div>
  );
}

export default Input;
