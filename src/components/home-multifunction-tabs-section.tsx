import { CatalogCategorySections } from '@/components/catalog-category-sections';
import { HOME_CATALOG_EQUIPMENT_SECTIONS } from '@/lib/home-catalog-sections';

const MULTIFUNCTION_SECTIONS = HOME_CATALOG_EQUIPMENT_SECTIONS.filter(
  (section) => section.id === 'multifuncionales',
);

export function HomeMultifunctionTabsSection() {
  if (MULTIFUNCTION_SECTIONS.length === 0) return null;

  return (
    <section className="border-t border-border/60 bg-muted/30 py-8 sm:py-10 lg:py-12">
      <div className="container">
        <CatalogCategorySections sectionsConfig={MULTIFUNCTION_SECTIONS} />
      </div>
    </section>
  );
}

