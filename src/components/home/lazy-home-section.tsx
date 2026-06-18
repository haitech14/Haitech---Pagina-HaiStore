import { lazy, Suspense, type ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyHomeSectionProps {
  children: ReactNode;
  /** Altura aproximada para reservar espacio con content-visibility. */
  minHeight?: string;
  className?: string;
  fallback?: ReactNode;
}

function DefaultFallback() {
  return (
    <div className="container py-8">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="mx-auto mt-4 h-32 w-full max-w-4xl" />
    </div>
  );
}

export function LazyHomeSection({
  children,
  minHeight = '400px',
  className,
  fallback,
}: LazyHomeSectionProps) {
  return (
    <div
      className={cn('home-deferred-section', className)}
      style={{ containIntrinsicSize: `auto ${minHeight}` }}
    >
      <Suspense fallback={fallback ?? <DefaultFallback />}>{children}</Suspense>
    </div>
  );
}

/** Re-export lazy para secciones below-the-fold de la home. */
export { lazy };
