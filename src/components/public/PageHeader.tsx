import Link from 'next/link';
import { Wordmark } from '@/components/ui/wordmark';
import { buttonClasses } from '@/components/ui/button';

export function PageHeader({
  title,
  subtitle,
  linkHref,
  linkLabel,
  linkShortLabel,
  linkIcon,
}: {
  title: string;
  subtitle?: React.ReactNode;
  linkHref: string;
  linkLabel: string;
  linkShortLabel: string;
  linkIcon: React.ReactNode;
}) {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 xl:max-w-5xl pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <Wordmark />
        <Link
          href={linkHref}
          aria-label={linkLabel}
          className={buttonClasses('secondary', 'sm')}
        >
          {linkIcon}
          <span className="sm:hidden">{linkShortLabel}</span>
          <span className="hidden sm:inline">{linkLabel}</span>
        </Link>
      </div>
      <div className="pb-8 pt-10 sm:pt-14">
        <h1 className="gold-text font-display text-5xl font-semibold leading-none sm:text-6xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-base text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}
