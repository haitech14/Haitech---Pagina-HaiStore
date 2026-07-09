import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export function AdminEmptyState({
  title,
  description,
  icon,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-3 py-5 text-center',
        className,
      )}
      role="status"
    >
      <span className="mb-2 flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-4" aria-hidden="true" />}
      </span>
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 max-w-xs text-[0.6875rem] text-muted-foreground">{description}</p>
    </div>
  );
}
