// frontend/src/components/ui/Dropdown.js
import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Dropdown — generic dismissible trigger+panel, generalizing the pattern already
 * hand-rolled inline in App.js for the notification panel (ref + mousedown outside-click).
 *
 * The caller's `trigger` render-prop is responsible for applying `aria-expanded={open}`
 * and `aria-haspopup="true"` to whatever element it renders, using the supplied `open`/`toggle`.
 *
 * Uncontrolled by default (internal state). Pass `open`/`onOpenChange` to control it externally
 * (e.g. to auto-open on an external event) — the outside-click/Escape handling still applies,
 * it just reports back through `onOpenChange` instead of only updating internal state.
 *
 * @param {(state: {open: boolean, toggle: function}) => React.ReactNode} trigger
 * @param {(state: {close: function}) => React.ReactNode} children - the panel content
 * @param {'left'|'right'} [align]
 * @param {boolean} [open] - controlled open state; omit for uncontrolled behavior
 * @param {function} [onOpenChange] - called with the next open value on toggle/outside-click/Escape
 */
function Dropdown({ trigger, children, align = 'left', className = '', open: controlledOpen, onOpenChange }) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const rootRef = useRef(null);
  const lastFocused = useRef(null);

  const setOpen = useCallback(
    (next) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const toggle = () => {
    const next = !open;
    if (next) lastFocused.current = document.activeElement;
    setOpen(next);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        lastFocused.current?.focus?.();
      }
    };

    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {trigger({ open, toggle })}
      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-50
            max-w-[calc(100vw-2rem)] animate-slide-down bg-surface-container-lowest rounded-2xl shadow-2xl
            border border-outline-variant/20 overflow-hidden`}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
