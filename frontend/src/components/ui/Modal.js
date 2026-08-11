// frontend/src/components/ui/Modal.js
import React, { useEffect, useRef, useId } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

/**
 * Modal — accessible dialog: role="dialog", focus trap, Escape-to-close,
 * body-scroll lock, focus returns to the trigger on close.
 * Net-new — not wired into any existing page yet.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title - required, drives aria-labelledby
 * @param {'sm'|'md'|'lg'} [size]
 * @param {React.RefObject} [initialFocusRef] - element to focus on open; defaults to the dialog container
 * @param {boolean} [closeOnBackdropClick]
 */
function Modal({ isOpen, onClose, title, size = 'md', initialFocusRef, closeOnBackdropClick = true, children }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const toFocus = initialFocusRef?.current || dialogRef.current;
    toFocus?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${SIZE_CLASSES[size]} bg-surface-container-lowest rounded-2xl p-8 shadow-2xl animate-scale-in focus:outline-none`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 id={titleId} className="text-2xl font-headline font-bold text-on-surface mb-6 pr-8">
          {title}
        </h2>

        {children}
      </div>
    </div>
  );
}

export default Modal;
