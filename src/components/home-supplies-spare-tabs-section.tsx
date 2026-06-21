import { CatalogCategorySections } from '@/components/catalog-category-sections';
import type { HomeCatalogSectionConfig } from '@/lib/home-catalog-sections';

const SUPPLIES_AND_SPARE_SECTIONS: HomeCatalogSectionConfig[] = [
  {
    id: 'toner-suministros',
    title: 'Tóner y suministros',
    subtitle: 'Consumibles originales, compatibles y remanufacturados',
    categoryPathSlug: 'toner-suministros',
    inventoryCategorySlugs: ['toner-suministros'],
  },
  {
    id: 'repuestos',
    title: 'Repuestos',
    subtitle: 'Partes y componentes para tus equipos',
    categoryPathSlug: 'repuestos',
    inventoryCategorySlugs: ['repuestos'],
  },
];

export function HomeSuppliesSpareTabsSection() {
  return (
    <section className="border-t border-border/60 bg-background py-8 sm:py-10 lg:py-12">
      <div className="container flex flex-col gap-10 sm:gap-12">
        <CatalogCategorySections sectionsConfig={SUPPLIES_AND_SPARE_SECTIONS} />
      </div>
    </section>
  );
}

