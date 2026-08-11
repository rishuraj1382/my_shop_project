// frontend/src/components/ui/Table.js
import React from 'react';

/**
 * Table primitives — match the markup already hand-rolled three times in the
 * Super Admin pages (Users/Shops/Orders). Not migrating those pages onto this
 * yet; this just makes the primitive available for a later phase.
 */

export function Table({ children, className = '' }) {
  return (
    <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = '', ...rest }) {
  return (
    <tr className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${className}`} {...rest}>
      {children}
    </tr>
  );
}

export function TableHeaderRow({ children }) {
  return (
    <tr className="border-b border-outline-variant/20 text-left text-xs text-on-surface-variant uppercase tracking-wider">
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className = '' }) {
  return <th className={`px-5 py-3 ${className}`}>{children}</th>;
}

export function TableCell({ children, className = '', ...rest }) {
  return (
    <td className={`px-5 py-4 ${className}`} {...rest}>
      {children}
    </td>
  );
}

const TableExports = { Table, TableHead, TableBody, TableRow, TableHeaderRow, TableHeaderCell, TableCell };
export default TableExports;
