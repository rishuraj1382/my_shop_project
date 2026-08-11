// frontend/src/components/ui/Select.js
import React, { useId } from 'react';

/**
 * Select — labeled native <select> with the same accessible id/error contract as Input.
 * Native select is used deliberately (no custom listbox) — no multi-select/search/async
 * option need exists anywhere in this app.
 * @param {string} label
 * @param {boolean} [labelHidden]
 * @param {string} [id]
 * @param {string} [error]
 * @param {string} [helperText]
 * @param {boolean} [required]
 */
function Select({
  label,
  labelHidden = false,
  id,
  error,
  helperText,
  required = false,
  className = '',
  children,
  ...rest
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className={`label-stitch ${labelHidden ? 'sr-only' : ''}`}>
          {label}{required && <span className="text-error"> *</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`input-stitch ${error ? 'ring-2 ring-error/40' : ''} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error mt-1.5 ml-1">{error}</p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-on-surface-variant mt-1.5 ml-1">{helperText}</p>
      )}
    </div>
  );
}

export default Select;
