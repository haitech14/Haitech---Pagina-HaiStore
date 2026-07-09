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
        'rounded-lg border border-border/60 bg-card p-3 shadow-sm',
        className,
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {actionLabel && actionHref && (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--admin-accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
          >
            {actionLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
