import { useSearchParams } from 'react-router-dom';

import { scrollToCategoryProducts } from '@/lib/category-path';
import {
  EQUIPMENT_STOREFRONT_CONDITIONS,
  getConditionsForCatalogFamily,
  getProductConditionLabel,
  isEquipmentCatalogFamily,
  parseProductCondition,
  type CatalogFamilySlug,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

interface ProductConditionTabsProps {
  activeCondition: ProductCondition | null;
  counts?: Partial<Record<ProductCondition, number>>;
  catalogFamily?: CatalogFamilySlug | null;
  conditions?: readonly ProductCondition[];
  /** Incluye pestaña «Todas» (estado sin filtro). Default true. */
  showAllOption?: boolean;
  className?: string;
}

function resolveTabConditions(
  catalogFamily: CatalogFamilySlug | null | undefined,
  conditions?: readonly ProductCondition[],
): readonly ProductCondition[] {
  if (conditions) return conditions;
  if (catalogFamily && isEquipmentCatalogFamily(catalogFamily)) {
    return EQUIPMENT_STOREFRONT_CONDITIONS;
  }
  if (!catalogFamily) {
    // /tienda sin familia: mismas pestañas de equipos.
    return EQUIPMENT_STOREFRONT_CONDITIONS;
  }
  return getConditionsForCatalogFamily(catalogFamily);
}

export function ProductConditionTabs({
  activeCondition,
  counts,
  catalogFamily = null,
  conditions,
  showAllOption = true,
  className,
}: ProductConditionTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabConditions = resolveTabConditions(catalogFamily, conditions);

  const selectCondition = (condition: ProductCondition | null) => {
    const next = new URLSearchParams(searchParams);
    if (condition) next.set('estado', condition);
    else next.delete('estado');
    setSearchParams(next, { replace: true, preventScrollReset: true });
    requestAnimationFrame(() => scrollToCategoryProducts('smooth'));
  };

  return (
    <div
      className={cn(
        'flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2',
        className,
      )}
      role="tablist"
      aria-label="Filtrar por condición"
    >
      {showAllOption ? (
        <button
          type="button"
          role="tab"
          aria-selected={activeCondition == null}
          className={cn(
            'inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors sm:h-10 sm:px-4',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
            activeCondition == null
              ? 'border-[#E30613] bg-[#E30613] text-white'
              : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
          )}
          onClick={() => selectCondition(null)}
        >
          Todas
        </button>
      ) : null}
      {tabConditions.map((condition) => {
        const count = counts?.[condition];
        const disabled = count === 0;
        const isActive = activeCondition === condition;
        return (
          <button
            key={condition}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={disabled}
            disabled={disabled}
            className={cn(
              'inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-sm font-semibold transition-colors sm:h-10 sm:px-4',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
              isActive
                ? 'border-[#E30613] bg-[#E30613] text-white'
                : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
              disabled && 'pointer-events-none opacity-45',
            )}
            onClick={() => selectCondition(condition)}
          >
            {getProductConditionLabel(condition, catalogFamily ?? 'multifuncionales')}
          </button>
        );
      })}
    </div>
  );
}

export function useCategoryConditionFilter(): ProductCondition | null {
  const [searchParams] = useSearchParams();
  return parseProductCondition(searchParams.get('estado'));
}
