// frontend/src/components/ui/SearchInput.js
import React from 'react';
import Input from './Input';

/**
 * SearchInput — Input composed with a search icon and a clear button shown
 * only when there's a value.
 * @param {string} value
 * @param {function} onChange
 * @param {function} onClear - required when value is truthy and a clear button should show
 */
function SearchInput({ value, onChange, onClear, ...rest }) {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      iconLeft="search"
      rightElement={
        value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        ) : undefined
      }
      {...rest}
    />
  );
}

export default SearchInput;
