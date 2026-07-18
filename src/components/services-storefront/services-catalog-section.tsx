import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ServicesCatalogCard } from '@/components/services-storefront/services-catalog-card';
import { ServicesCatalogFiltersPanel } from '@/components/services-storefront/services-catalog-filters';
import {
  filterServices,
  getCatalogPriceBounds,
  SERVICES_CATALOG_ID,
} from '@/data/services-catalog';
import type {
  ServiceCatalogCategoryId,
  ServiceCatalogFilters,
} from '@/types/services-catalog';
import { cn } from '@/lib/utils';

interface ServicesCatalogSectionProps {
  /** Categoría controlada desde el hub (sincroniza hero + URL). */
  activeCategory?: ServiceCatalogCategoryId | null;
  onCategoryChange?: (categoryId: ServiceCatalogCategoryId | null) => void;
  className?: string;
}

const EMPTY_FILTERS = (bounds: { min: number; max: number }): ServiceCatalogFilters => ({
  categories: [],
  availability: [],
  priceMin: bounds.min,
  priceMax: bounds.max,
  contractTypes: [],
  eventCapacities: [],
  search: '',
});

export function ServicesCatalogSection({
  activeCategory = null,
  onCategoryChange,
  className,
}: ServicesCatalogSectionProps) {
  const bounds = getCatalogPriceBounds();
  const [filters, setFilters] = useState<ServiceCatalogFilters>(() => ({
    ...EMPTY_FILTERS(bounds),
    categories: activeCategory ? [activeCategory] : [],
  }));
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setFilters((prev) => {
      const nextCategories = activeCategory ? [activeCategory] : [];
      const same =
        prev.categories.length === nextCategories.length &&
        prev.categories.every((id, index) => id === nextCategories[index]);
      if (same) return prev;
      return { ...prev, categories: nextCategories };
    });
  }, [activeCategory]);

  const filteredItems = useMemo(() => filterServices(filters), [filters]);

  const handleFiltersChange = (next: ServiceCatalogFilters) => {
    setFilters(next);
    const selected = next.categories[0] ?? null;
    onCategoryChange?.(selected);
  };

  return (
    <section
      id={SERVICES_CATALOG_ID}
      aria-labelledby="servicios-catalogo-titulo"
      className={cn('scroll-mt-20 bg-[#f8f8f8] py-8 sm:py-10', className)}
    >
      <div className="container px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Catálogo</p>
            <h2 id="servicios-catalogo-titulo" className="text-2xl font-bold text-neutral-950 sm:text-3xl">
              Servicios disponibles
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredItems.length} resultado{filteredItems.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Buscar servicios…"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="h-10 pl-9"
                aria-label="Buscar servicios"
              />
            </div>

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 gap-2 lg:hidden"
                  aria-label="Abrir filtros"
                >
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ServicesCatalogFiltersPanel
                    filters={filters}
                    onChange={handleFiltersChange}
                    className="border-0 shadow-none"
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ServicesCatalogFiltersPanel filters={filters} onChange={handleFiltersChange} />
          </div>

          <div>
            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
                <p className="font-medium text-foreground">No hay servicios con estos filtros</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prueba ajustando categoría, precio o disponibilidad.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setFilters(EMPTY_FILTERS(bounds));
                    onCategoryChange?.(null);
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <ServicesCatalogCard key={item.slug} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
