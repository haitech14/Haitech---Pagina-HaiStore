import { SERVICES_CATALOG_ITEMS } from '@/data/services-catalog';
import type { ServiceCatalogItem } from '@/types/services-catalog';

export type ServicesTechnicalShowcaseCategoryId =
  | 'mantenimiento'
  | 'planes'
  | 'suministros'
  | 'garantia'
  | 'puesta-en-marcha'
  | 'especializados';

export type ServicesTechnicalFilterId = 'todos' | 'fijo' | 'plan';

export type ServicesTechnicalShowcaseCategory = {
  id: ServicesTechnicalShowcaseCategoryId;
  label: string;
  image: string;
  /** IDs de card del landing `soporte-tecnico` (sufijo del slug). */
  cardIds: readonly string[];
};

export const SERVICES_TECHNICAL_SHOWCASE_CATEGORIES: readonly ServicesTechnicalShowcaseCategory[] =
  [
    {
      id: 'mantenimiento',
      label: 'Mantenimiento',
      image: '/services/servicio-tecnico/preventivo.png',
      cardIds: ['preventivo', 'correctivo', 'general'],
    },
    {
      id: 'planes',
      label: 'Planes',
      image: '/services/servicio-tecnico/planes.png',
      cardIds: ['planes'],
    },
    {
      id: 'suministros',
      label: 'Suministros',
      image: '/services/servicio-tecnico/suministro.png',
      cardIds: ['suministro'],
    },
    {
      id: 'garantia',
      label: 'Garantía',
      image: '/services/servicio-tecnico/garantia.png',
      cardIds: ['garantia'],
    },
    {
      id: 'puesta-en-marcha',
      label: 'Puesta en marcha',
      image: '/services/servicio-tecnico/planes.png',
      cardIds: ['instalacion-config-capacitacion', 'soporte-remoto'],
    },
    {
      id: 'especializados',
      label: 'Especializados',
      image: '/services/servicio-tecnico/correctivo.png',
      cardIds: ['actualizacion-firmware', 'reparacion-fuente-tarjetas'],
    },
  ];

export const SERVICES_TECHNICAL_SHOWCASE_FILTERS: readonly {
  id: ServicesTechnicalFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'fijo', label: 'Precio fijo' },
  { id: 'plan', label: 'Con plan' },
];

export const SERVICES_TECHNICAL_SHOWCASE_DEFAULT_CATEGORY: ServicesTechnicalShowcaseCategoryId =
  'mantenimiento';

function cardIdFromSlug(slug: string): string {
  return slug.replace(/^servicio-tecnico-/, '');
}

export function listTechnicalServiceProducts(): readonly ServiceCatalogItem[] {
  return SERVICES_CATALOG_ITEMS.filter((item) => item.categoryId === 'servicio-tecnico');
}

export function filterTechnicalServiceProducts(options: {
  categoryId: ServicesTechnicalShowcaseCategoryId;
  filterId: ServicesTechnicalFilterId;
}): ServiceCatalogItem[] {
  const category = SERVICES_TECHNICAL_SHOWCASE_CATEGORIES.find((c) => c.id === options.categoryId);
  const cardIds = new Set(category?.cardIds ?? []);

  return listTechnicalServiceProducts().filter((item) => {
    const cardId = cardIdFromSlug(item.slug);
    if (cardIds.size > 0 && !cardIds.has(cardId)) return false;

    if (options.filterId === 'fijo') {
      return item.pricingMode === 'fixed';
    }
    if (options.filterId === 'plan') {
      return item.pricingMode !== 'fixed';
    }
    return true;
  });
}
