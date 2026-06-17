import { cn } from '@/lib/utils';

/** Píldora para ficha de producto (hero y destacados). */
const DETAIL_BADGE_BASE =
  'inline-flex h-7 shrink-0 items-center justify-center rounded-full border border-transparent px-3.5 text-[0.6875rem] font-bold uppercase leading-none tracking-[0.14em] antialiased sm:h-8 sm:px-4 sm:text-xs sm:tracking-[0.12em]';

/** Píldora compacta para tarjetas de catálogo. */
const CATALOG_BADGE_BASE =
  'inline-flex h-6 shrink-0 items-center justify-center rounded-full px-2.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.12em] antialiased sm:h-[1.625rem] sm:px-3 sm:text-[0.6875rem]';

export function ProductNuevoCornerBadge({
  variant = 'catalog',
  className,
}: {
  variant?: 'catalog' | 'highlight' | 'detail';
  className?: string;
}) {
  if (variant === 'highlight' || variant === 'detail') {
    return (
      <span
        className={cn(
          DETAIL_BADGE_BASE,
          'bg-red-600 text-white shadow-[0_1px_2px_rgba(220,38,38,0.35)] ring-1 ring-inset ring-white/25',
          className,
        )}
      >
        Nuevo
      </span>
    );
  }

  return (
    <span
      className={cn(
        CATALOG_BADGE_BASE,
        'bg-green-600 text-white shadow-sm ring-1 ring-inset ring-white/20',
        className,
      )}
    >
      Nuevo
    </span>
  );
}

export function ProductBrandBadge({
  brand,
  className,
  variant = 'detail',
}: {
  brand: string;
  className?: string;
  variant?: 'catalog' | 'detail';
}) {
  const label = brand.trim();
  if (!label) return null;

  return (
    <span
      className={cn(
        variant === 'detail' ? DETAIL_BADGE_BASE : CATALOG_BADGE_BASE,
        'bg-[#0f1f3d] text-white shadow-[0_1px_2px_rgba(15,31,61,0.28)] ring-1 ring-inset ring-white/15',
        className,
      )}
    >
      {label}
    </span>
  );
}
