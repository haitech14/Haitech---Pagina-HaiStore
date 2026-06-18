import { Badge } from '@/components/ui/badge';
import { formatSubcategoryTabLabel } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

type CatalogTabsAlign = 'start' | 'center' | 'end';
type SubcategoryTabsVariant = 'default' | 'on-dark';

interface SubcategoryTabsProps {
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  onSelect: (subSlug: string | null) => void;
  className?: string;
  heading?: string;
  parentName?: string | null;
  align?: CatalogTabsAlign;
  variant?: SubcategoryTabsVariant;
  showHeading?: boolean;
  /** Pestañas más bajas para integrar en la barra del catálogo. */
  compact?: boolean;
}

const tabsRowAlignClass: Record<CatalogTabsAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

function CatalogTabsHeading({
  children,
  variant = 'default',
}: {
  children: string;
  variant?: SubcategoryTabsVariant;
}) {
  return (
    <p
      className={cn(
        'shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] sm:text-xs',
        variant === 'on-dark' ? 'text-white/65' : 'text-muted-foreground',
      )}
    >
      {children}
    </p>
  );
}

export function SubcategoryTabs({
  subcategories,
  activeSubSlug,
  onSelect,
  className,
  heading = 'Categorías',
  parentName = null,
  align = 'start',
  variant = 'default',
  showHeading = true,
  compact = false,
}: SubcategoryTabsProps) {
  if (subcategories.length === 0) return null;

  return (
    <section aria-label={heading} className={cn('w-full', className)}>
      <div
        className={cn(
          'flex items-center',
          compact ? 'flex-nowrap gap-x-1.5' : 'flex-wrap gap-x-3 gap-y-2',
          !showHeading && align === 'center' && 'justify-center',
          showHeading &&
            '-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0',
          showHeading && tabsRowAlignClass[align],
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {showHeading ? <CatalogTabsHeading variant={variant}>{heading}</CatalogTabsHeading> : null}
        <div
          role="tablist"
          aria-label={heading}
          className={cn(
            'flex items-center gap-1.5 sm:gap-2',
            compact ? 'flex-nowrap' : 'flex-wrap',
            tabsRowAlignClass[align],
            !showHeading && 'justify-start',
          )}
        >
        {subcategories.map((sub) => {
          const isActive = activeSubSlug === sub.slug;
          const count = sub.productCount ?? 0;
          const label = formatSubcategoryTabLabel(sub.name, parentName);

          return (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(sub.slug)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border font-semibold shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                compact
                  ? 'min-h-8 px-2 py-1 text-[0.6875rem] sm:min-h-9 sm:px-2.5 sm:py-1.5 sm:text-xs'
                  : 'min-h-11 gap-2 px-3.5 py-2 text-sm',
                variant === 'on-dark' && 'focus-visible:ring-offset-neutral-950',
                isActive
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                  : variant === 'on-dark'
                    ? 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15'
                    : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
              )}
            >
              <span className="whitespace-nowrap">{label}</span>
              {count > 0 ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-4 min-w-4 shrink-0 px-1 text-[0.6rem] leading-none sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-[0.65rem]',
                    isActive && 'border-white/25 bg-white/20 text-white',
                    variant === 'on-dark' && !isActive && 'border-white/15 bg-white/10 text-white/90',
                  )}
                >
                  {count}
                </Badge>
              ) : null}
            </button>
          );
        })}
        </div>
      </div>
    </section>
  );
}
