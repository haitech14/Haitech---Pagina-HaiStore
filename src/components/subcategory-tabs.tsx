import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface SubcategoryTabsProps {
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  onSelect: (subSlug: string | null) => void;
  verTodoLabel?: string;
  className?: string;
}

export function SubcategoryTabs({
  subcategories,
  activeSubSlug,
  onSelect,
  verTodoLabel = 'Ver todo',
  className,
}: SubcategoryTabsProps) {
  if (subcategories.length === 0) return null;

  return (
    <section aria-label="Subcategorías" className={className}>
      <div
        role="tablist"
        aria-label="Subcategorías"
        className="-mx-4 flex flex-wrap items-center justify-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeSubSlug === null}
          onClick={() => onSelect(null)}
          className={cn(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
            activeSubSlug === null
              ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
              : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
          )}
        >
          {verTodoLabel}
        </button>

        {subcategories.map((sub) => {
          const isActive = activeSubSlug === sub.slug;
          const count = sub.productCount ?? 0;

          return (
            <button
              key={sub.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(sub.slug)}
              className={cn(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                  : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
              )}
            >
              <span className="whitespace-nowrap">{sub.name}</span>
              {count > 0 ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5 min-w-5 shrink-0 px-1.5 text-[0.65rem] leading-none',
                    isActive && 'border-white/25 bg-white/20 text-white',
                  )}
                >
                  {count}
                </Badge>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
