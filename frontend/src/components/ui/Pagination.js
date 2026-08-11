// frontend/src/components/ui/Pagination.js
import React from 'react';

function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-4 mt-6 flex-wrap">
      <p className="text-xs text-on-surface-variant">
        Showing <span className="font-bold text-on-surface">{startItem}–{endItem}</span> of{' '}
        <span className="font-bold text-on-surface">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <span className="text-xs font-bold text-on-surface-variant px-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
