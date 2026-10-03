import React from 'react';

// --- Card ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-md border border-slate-100',
        'transition-shadow duration-300',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// --- Card Header ---

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={[
        'px-6 py-5 border-b border-slate-100',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// --- Card Title ---

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({
  children,
  className = '',
  as: Tag = 'h3',
}: CardTitleProps) {
  return (
    <Tag
      className={[
        'text-[#0A192F] font-semibold text-lg leading-snug',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  );
}

// --- Card Content ---

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={['px-6 py-5', className].join(' ')}>{children}</div>
  );
}

// --- Card Footer ---

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={[
        'px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
