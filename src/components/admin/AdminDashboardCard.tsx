import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AdminDashboardCardProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  children: ReactNode;
}

export function AdminDashboardCard({
  title,
  actionLabel,
  actionHref,
  className,
  children,
}: AdminDashboardCardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:p-6',
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {actionLabel && actionHref && (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--admin-accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
          >
            {actionLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
