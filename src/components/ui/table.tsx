import React from 'react';

// --- Table root ---

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table
        className={[
          'w-full text-sm text-left border-collapse',
          className,
        ].join(' ')}
      >
        {children}
      </table>
    </div>
  );
}

// --- Table Head ---

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <thead
      className={[
        'bg-[#0A192F] text-[#D4AF37] text-xs uppercase tracking-wider',
        className,
      ].join(' ')}
    >
      {children}
    </thead>
  );
}

// --- Table Body ---

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody
      className={[
        'divide-y divide-slate-100 bg-white',
        className,
      ].join(' ')}
    >
      {children}
    </tbody>
  );
}

// --- Table Row ---

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isHighlighted?: boolean;
}

export function TableRow({
  children,
  className = '',
  onClick,
  isHighlighted = false,
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={[
        'transition-colors duration-150',
        onClick ? 'cursor-pointer hover:bg-amber-50' : 'hover:bg-slate-50/70',
        isHighlighted ? 'bg-amber-50 border-l-4 border-l-[#D4AF37]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </tr>
  );
}

// --- Table Header Cell ---

interface TableThProps {
  children?: React.ReactNode;
  className?: string;
}

export function TableTh({ children, className = '' }: TableThProps) {
  return (
    <th
      scope="col"
      className={[
        'px-4 py-3 font-semibold whitespace-nowrap',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}

// --- Table Data Cell ---

interface TableTdProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableTd({
  children,
  className = '',
  colSpan,
}: TableTdProps) {
  return (
    <td
      colSpan={colSpan}
      className={[
        'px-4 py-3 text-slate-700 align-top',
        className,
      ].join(' ')}
    >
      {children}
    </td>
  );
}
