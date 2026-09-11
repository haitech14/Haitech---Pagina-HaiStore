import {
  SOFTWARE_CATALOG_CATEGORIES,
  SOFTWARE_CATALOG_ITEMS,
} from '@/data/software-catalog';
import type {
  SoftwareCatalogCategoryId,
  SoftwareCatalogItem,
} from '@/types/software-catalog';

export type SoftwareSolutionsFilterId =
  | 'todos'
  | 'disponible'
  | 'popular'
  | 'mensual'
  | 'anual';

export type SoftwareSolutionsShowcaseCategory = {
  id: SoftwareCatalogCategoryId;
  label: string;
  image: string;
};

const CATEGORY_FALLBACK_IMAGES: Record<SoftwareCatalogCategoryId, string> = {
  'gestion-documental': '/categories/soluciones-negocio.png',
  'automatizacion-procesos': '/services/servicios-corporativos/saas.png',
  'impresion-y-captura': '/categories/escaneres.png',
  'integracion-ricoh': '/categories/impresoras.png',
  antivirus: '/products/eset-nod32-licencia-12-meses.webp',
  'inteligencia-artificial': '/services/servicios-corporativos/web.png',
  'software-empresarial': '/logos/haisupport-logo.png',
};

function firstImageForCategory(categoryId: SoftwareCatalogCategoryId): string {
  const item = SOFTWARE_CATALOG_ITEMS.find((entry) => entry.categoryId === categoryId);
  return item?.images[0] ?? CATEGORY_FALLBACK_IMAGES[categoryId];
}

export const SOFTWARE_SOLUTIONS_SHOWCASE_CATEGORIES: readonly SoftwareSolutionsShowcaseCategory[] =
  SOFTWARE_CATALOG_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    image: firstImageForCategory(category.id),
  }));

export const SOFTWARE_SOLUTIONS_SHOWCASE_FILTERS: readonly {
  id: SoftwareSolutionsFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'disponible', label: 'Disponible' },
  { id: 'popular', label: 'Popular' },
  { id: 'mensual', label: 'Mensual' },
  { id: 'anual', label: 'Anual' },
];

export const SOFTWARE_SOLUTIONS_SHOWCASE_DEFAULT_CATEGORY: SoftwareCatalogCategoryId =
  'gestion-documental';

export function filterSoftwareSolutionsProducts(options: {
  categoryId: SoftwareCatalogCategoryId;
  filterId: SoftwareSolutionsFilterId;
}): SoftwareCatalogItem[] {
  return SOFTWARE_CATALOG_ITEMS.filter((item) => {
    if (item.categoryId !== options.categoryId) return false;

    switch (options.filterId) {
      case 'todos':
        return true;
      case 'disponible':
      case 'popular':
        return item.availability === options.filterId || item.badge === options.filterId;
      case 'mensual':
        return item.contractTypes.includes('mensual');
      case 'anual':
        return item.contractTypes.includes('anual');
      default: {
        const _exhaustive: never = options.filterId;
        return _exhaustive;
      }
    }
  });
}
