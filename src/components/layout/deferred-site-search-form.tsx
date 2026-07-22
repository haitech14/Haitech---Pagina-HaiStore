import { lazy, Suspense, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const SiteSearchForm = lazy(() =>
  import('@/components/layout/site-search-form').then((m) => ({
    default: m.SiteSearchForm,
  })),
);

type DeferredSiteSearchFormProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: 'segmented' | 'simple' | 'header-dark';
  size?: 'default' | 'compact' | 'dense';
  showSearchIcons?: boolean;
  autoFocusInput?: boolean;
  showCategoryFilter?: boolean;
};

function SearchShell({
  className,
  variant = 'segmented',
  size = 'default',
}: {
  className?: string;
  variant?: DeferredSiteSearchFormProps['variant'];
  size?: DeferredSiteSearchFormProps['size'];
}) {
  const dark = variant === 'header-dark';
  const compact = size === 'compact' || size === 'dense';

  return (
    <div
      className={cn(
        'flex w-full items-center rounded-md border px-3',
        compact ? 'h-9' : 'h-11',
        dark ? 'border-white/20 bg-white/10' : 'border-[#D9DEE7] bg-white',
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={cn('h-2.5 w-24 rounded-full', dark ? 'bg-white/25' : 'bg-[#E8ECF1]')}
      />
    </div>
  );
}

/**
 * Buscador del header: shell inmediato; chunk completo al idle o al primer focus/pointer.
 */
export function DeferredSiteSearchForm(props: DeferredSiteSearchFormProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const load = () => {
      if (!cancelled) setReady(true);
    };

    // En home: más tarde para no competir con 2ª/3ª oleada; intent sigue inmediato.
    const onHome = typeof window !== 'undefined' && window.location.pathname === '/';
    const idleTimeout = onHome ? 4500 : 2500;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(load, { timeout: idleTimeout });
    } else {
      timeoutId = window.setTimeout(load, onHome ? 800 : 400);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  const warm = () => setReady(true);

  if (!ready) {
    return (
      <button
        type="button"
        className={cn('w-full text-left', props.className)}
        aria-label="Abrir buscador"
        onFocus={warm}
        onPointerEnter={warm}
        onClick={warm}
      >
        <SearchShell
          {...(props.className ? { className: props.className } : {})}
          {...(props.variant ? { variant: props.variant } : {})}
          {...(props.size ? { size: props.size } : {})}
        />
      </button>
    );
  }

  return (
    <Suspense
      fallback={
        <SearchShell
          {...(props.className ? { className: props.className } : {})}
          {...(props.variant ? { variant: props.variant } : {})}
          {...(props.size ? { size: props.size } : {})}
        />
      }
    >
      <SiteSearchForm {...props} />
    </Suspense>
  );
}
