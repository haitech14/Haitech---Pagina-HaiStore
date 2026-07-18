import { cn } from '@/lib/utils';

export type StoreCatalogCategoryOption = {
  slug: string;
  label: string;
  count?: number;
};

interface StoreCatalogCategoryChipsProps {
  categories: readonly StoreCatalogCategoryOption[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  className?: string;
}

export function StoreCatalogCategoryChips({
  categories,
  activeSlug,
  onSelect,
  className,
}: StoreCatalogCategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <div className={cn('min-w-0', className)}>
      <ul
        className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Filtrar por categoría"
      >
        <li className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-pressed={activeSlug == null}
            className={cn(
              'inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              activeSlug == null
                ? 'border-[#E30613] bg-[#FFF5F5] text-[#E30613]'
                : 'border-border/80 bg-white text-[#444444] hover:border-[#E30613]/40 hover:bg-[#FFFAFA]',
            )}
          >
            Todas
          </button>
        </li>
        {categories.map((category) => {
          const isActive = activeSlug === category.slug;
          return (
            <li key={category.slug} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(isActive ? null : category.slug)}
                aria-pressed={isActive}
                className={cn(
                  'inline-flex h-8 max-w-[14rem] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  isActive
                    ? 'border-[#E30613] bg-[#FFF5F5] text-[#E30613]'
                    : 'border-border/80 bg-white text-[#444444] hover:border-[#E30613]/40 hover:bg-[#FFFAFA]',
                )}
              >
                <span className="truncate">{category.label}</span>
                {typeof category.count === 'number' ? (
                  <span
                    className={cn(
                      'tabular-nums text-[0.65rem] font-medium',
                      isActive ? 'text-[#E30613]/80' : 'text-muted-foreground',
                    )}
                  >
                    {category.count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
