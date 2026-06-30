import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Cog, Globe, Package, Recycle, Star, type LucideIcon } from 'lucide-react';

import {
  getProductConditionLabel,
  isEquipmentCatalogFamily,
  PRODUCT_CONDITIONS,
  type CatalogFamilySlug,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

const DEFAULT_CONDITION_ICONS: Record<ProductCondition, LucideIcon> = {
  originales: BadgeCheck,
  compatibles: Package,
  remanufacturados: Recycle,
  partes: Cog,
};

const EQUIPMENT_CONDITION_ICONS: Record<ProductCondition, LucideIcon> = {
  originales: Star,
  compatibles: Globe,
  remanufacturados: Recycle,
  partes: Cog,
};

const SUPPLIES_CONDITION_ICONS: Record<ProductCondition, LucideIcon> = {
  originales: BadgeCheck,
  compatibles: Package,
  remanufacturados: Recycle,
  partes: Cog,
};

function resolveConditionIcon(
  condition: ProductCondition,
  catalogFamily: CatalogFamilySlug | null,
): LucideIcon {
  if (catalogFamily && isEquipmentCatalogFamily(catalogFamily)) {
    return EQUIPMENT_CONDITION_ICONS[condition];
  }
  if (catalogFamily === 'toner-suministros' || catalogFamily === 'repuestos') {
    return SUPPLIES_CONDITION_ICONS[condition];
  }
  return DEFAULT_CONDITION_ICONS[condition];
}

interface ProductConditionTabListProps {
  idPrefix: string;
  activeCondition: ProductCondition;
  onSelect: (condition: ProductCondition) => void;
  counts?: Partial<Record<ProductCondition, number>>;
  ariaLabel: string;
  className?: string;
  catalogFamily?: CatalogFamilySlug | null;
  conditions?: readonly ProductCondition[];
}

export function ProductConditionTabList({
  idPrefix,
  activeCondition,
  onSelect,
  counts,
  ariaLabel,
  className,
  catalogFamily = null,
  conditions = PRODUCT_CONDITIONS,
}: ProductConditionTabListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollHint, setCanScrollHint] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const update = () => {
      setCanScrollHint(element.scrollWidth > element.clientWidth + element.scrollLeft + 4);
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [conditions]);

  return (
    <div className="relative">
      {canScrollHint ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-background via-background/85 to-transparent lg:hidden"
          aria-hidden="true"
        />
      ) : null}
      <div
        ref={scrollRef}
        className={cn(
          'flex max-w-full flex-nowrap items-center justify-start gap-1.5 overflow-x-auto lg:justify-end',
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
        role="tablist"
        aria-label={ariaLabel}
      >
      {conditions.map((condition) => {
        const count = counts?.[condition];
        const isActive = activeCondition === condition;
        const Icon = resolveConditionIcon(condition, catalogFamily);
        const label = getProductConditionLabel(condition, catalogFamily);

        return (
          <button
            key={condition}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${condition}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${condition}`}
            onClick={() => onSelect(condition)}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:min-h-10 sm:px-3.5 sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              isActive
                ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(204,20,39,0.28)]'
                : 'border-border/80 bg-white text-foreground hover:border-border hover:bg-muted/40',
            )}
          >
            <Icon className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" strokeWidth={2} />
            {label}
            {count != null ? (
              <span className="sr-only">
                {`, ${count} producto${count === 1 ? '' : 's'}`}
              </span>
            ) : null}
          </button>
        );
      })}
      </div>
    </div>
  );
}
