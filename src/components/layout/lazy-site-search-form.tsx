import { lazy, Suspense, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

const SiteSearchForm = lazy(() =>
  import('@/components/layout/site-search-form').then((m) => ({
    default: m.SiteSearchForm,
  })),
);

type LazySiteSearchFormProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: 'segmented' | 'simple' | 'header-dark';
  size?: 'default' | 'compact' | 'dense';
  showSearchIcons?: boolean;
  autoFocusInput?: boolean;
  showCategoryFilter?: boolean;
};

const IDLE_LOAD_MS = 800;

function SiteSearchShell({
  className,
  variant = 'segmented',
  size = 'default',
  showSearchIcons = false,
  onActivate,
}: LazySiteSearchFormProps & { onActivate: () => void }) {
  const isCompact = size === 'compact';
  const isDense = size === 'dense';
  const placeholder =
    variant === 'header-dark' || isDense
      ? 'Buscar productos...'
      : 'Buscar productos, categorías o marcas...';

  const barClass =
    variant === 'header-dark'
      ? 'flex w-full items-stretch overflow-hidden rounded-lg border border-white/30 bg-white shadow-sm'
      : isDense
        ? 'flex w-full max-w-full items-stretch overflow-hidden rounded-full border-0 bg-white shadow-sm'
        : isCompact
          ? 'flex w-full items-stretch overflow-hidden rounded-md border border-border/80 bg-white shadow-sm'
          : 'flex w-full items-stretch overflow-hidden rounded-lg border border-border/80 bg-white shadow-sm';

  const inputHeight = variant === 'header-dark' || isCompact ? 'h-9' : isDense ? 'h-10' : 'h-11';
  const showLeadingIcon = showSearchIcons && variant === 'segmented';
  const showSubmitIcon = showSearchIcons && variant === 'segmented';

  return (
    <div className={cn('relative w-full', className)}>
      <div className={barClass}>
        <div className="relative min-w-0 flex-1">
          {showLeadingIcon ? (
            <Search
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
                isCompact || isDense ? 'left-2.5 size-3.5' : 'left-3 size-4',
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          ) : null}
          <input
            type="search"
            placeholder={placeholder}
            aria-label="Buscar"
            className={cn(
              inputHeight,
              'w-full min-w-0 flex-1 border-0 bg-transparent py-0 text-foreground outline-none placeholder:text-muted-foreground/70',
              variant === 'header-dark'
                ? 'pl-2.5 pr-2 text-[0.8125rem]'
                : showLeadingIcon
                  ? isCompact || isDense
                    ? 'pl-8 pr-2 text-[0.8125rem]'
                    : 'pl-10 pr-3 text-sm'
                  : isCompact || isDense
                    ? 'pl-3 pr-2 text-[0.8125rem]'
                    : 'pl-3 pr-3 text-sm',
            )}
            onFocus={onActivate}
          />
        </div>
        {variant === 'header-dark' ? (
          <button
            type="button"
            aria-label="Buscar"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground"
            onClick={onActivate}
          >
            <Search className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : showSubmitIcon ? (
          <button
            type="button"
            aria-label="Buscar"
            className={cn(
              'flex shrink-0 items-center justify-center border-0 bg-red-600 text-white',
              isCompact ? 'h-9 w-9 rounded-r-[calc(var(--radius)-1px)]' : isDense ? 'h-10 w-10 rounded-r-full' : 'h-11 w-11 rounded-r-[calc(var(--radius)-1px)]',
            )}
            onClick={onActivate}
          >
            <Search
              className={isCompact || isDense ? 'size-3.5' : 'size-4'}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Monta SiteSearchForm al foco o en idle (~800ms) para no meter
 * búsqueda/product-card en el chunk crítico del header.
 */
export function LazySiteSearchForm(props: LazySiteSearchFormProps) {
  const [ready, setReady] = useState(false);
  const [focusAfterLoad, setFocusAfterLoad] = useState(false);

  useEffect(() => {
    if (ready) return;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const activate = () => setReady(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(activate, { timeout: IDLE_LOAD_MS });
    } else {
      timeoutId = setTimeout(activate, IDLE_LOAD_MS);
    }

    return () => {
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [ready]);

  if (!ready) {
    return (
      <SiteSearchShell
        {...props}
        onActivate={() => {
          setFocusAfterLoad(true);
          setReady(true);
        }}
      />
    );
  }

  return (
    <Suspense fallback={<SiteSearchShell {...props} onActivate={() => undefined} />}>
      <SiteSearchForm {...props} autoFocusInput={props.autoFocusInput || focusAfterLoad} />
    </Suspense>
  );
}
