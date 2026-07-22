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
  /** Monta en idle tras el primer paint (promos/banner de 2ª oleada). */
  mountOnIdle?: boolean;
  /** Timeout de idle en ms cuando `mountOnIdle` está activo. */
  idleTimeoutMs?: number;
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
  mountOnIdle = false,
  idleTimeoutMs = 900,
}: LazyHomeSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!deferUntilVisible && !mountOnIdle);

  useEffect(() => {
    if (isVisible) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let observer: IntersectionObserver | undefined;

    const reveal = () => {
      if (!cancelled) setIsVisible(true);
    };

    if (mountOnIdle) {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(reveal, { timeout: idleTimeoutMs });
      } else {
        timeoutId = window.setTimeout(reveal, Math.min(idleTimeoutMs, 200));
      }
    }

    if (deferUntilVisible) {
      const node = rootRef.current;
      if (!node) {
        /* wait for ref */
      } else if (typeof IntersectionObserver === 'undefined') {
        reveal();
      } else {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              reveal();
              observer?.disconnect();
            }
          },
          { rootMargin: '200px 0px' },
        );
        observer.observe(node);
      }
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [deferUntilVisible, idleTimeoutMs, isVisible, mountOnIdle]);

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

