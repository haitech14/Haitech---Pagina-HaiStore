import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyHomeSectionProps {
  children: ReactNode;
  /** Altura aproximada para reservar espacio con content-visibility. */
  minHeight?: string;
  className?: string;
  fallback?: ReactNode;
  /** Si es false, monta hijos de inmediato (p. ej. secciones above-the-fold). */
  deferUntilVisible?: boolean;
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
  deferUntilVisible = true,
}: LazyHomeSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!deferUntilVisible);

  useEffect(() => {
    if (!deferUntilVisible || isVisible) return;

    const node = rootRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [deferUntilVisible, isVisible]);

  return (
    <div
      ref={rootRef}
      className={cn('home-deferred-section', className)}
      style={{ containIntrinsicSize: `auto ${minHeight}` }}
    >
      {isVisible ? (
        <Suspense fallback={fallback ?? <DefaultFallback />}>{children}</Suspense>
      ) : (
        (fallback ?? <DefaultFallback />)
      )}
    </div>
  );
}

/** Re-export lazy para secciones below-the-fold de la home. */
export { lazy };

