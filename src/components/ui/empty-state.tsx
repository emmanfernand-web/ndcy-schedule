import { cn } from '@/lib/cn';

export function EmptyState({
  icon,
  title,
  children,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center',
        className
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}
