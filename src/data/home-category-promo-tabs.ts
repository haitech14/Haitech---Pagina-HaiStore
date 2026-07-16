import { categoryLandingPath } from '@/lib/category-path';

export type HomeCategoryPromoTabId = 'equipos' | 'consumibles' | 'repuestos';

export type HomeCategoryPromoTab = {
  id: HomeCategoryPromoTabId;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  featureTitle: string;
  featureDescription: string;
  /** Banner completo (fallback / mobile). */
  bannerImage: string;
  /** Recorte del producto a la derecha. */
  productImage: string;
  productImageAlt: string;
};

export const HOME_CATEGORY_PROMO_TABS: readonly HomeCategoryPromoTab[] = [
  {
    id: 'equipos',
    label: 'Equipos',
    title: 'Equipos',
    subtitle: 'Soluciones de impresión para tu negocio',
    description: 'Tecnología confiable, alto rendimiento y soporte especializado.',
    ctaHref: '/tienda',
    ctaLabel: 'Ver catálogo',
    featureTitle: 'Tecnología profesional',
    featureDescription:
      'Equipos diseñados para ofrecer máximo rendimiento y confiabilidad.',
    bannerImage: '/home/category-promo-tabs/equipos.webp',
    productImage: '/home/category-promo-tabs/equipos-product.webp',
    productImageAlt: 'Multifuncional Ricoh para oficina',
  },
  {
    id: 'consumibles',
    label: 'Tóner y consumibles',
    title: 'Tóner y consumibles',
    subtitle: 'Consumibles de impresión de alta calidad',
    description: 'Tóner, unidades y suministros para un rendimiento constante.',
    ctaHref: categoryLandingPath('toner-suministros'),
    ctaLabel: 'Ver catálogo',
    featureTitle: 'Suministro confiable',
    featureDescription: 'Rendimiento constante página tras página.',
    bannerImage: '/home/category-promo-tabs/toner.webp',
    productImage: '/home/category-promo-tabs/toner-product.webp',
    productImageAlt: 'Unidad de tóner y consumibles Ricoh',
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    title: 'Repuestos',
    subtitle: 'Piezas y componentes para tus equipos',
    description:
      'Repuestos confiables para mantenimiento, reparación y continuidad operativa.',
    ctaHref: categoryLandingPath('repuestos'),
    ctaLabel: 'Ver catálogo',
    featureTitle: 'Compatibilidad garantizada',
    featureDescription: 'Rendimiento confiable para tus equipos.',
    bannerImage: '/home/category-promo-tabs/repuestos.webp',
    productImage: '/home/category-promo-tabs/repuestos-product.webp',
    productImageAlt: 'Repuesto original para equipos de impresión',
  },
] as const;

export const HOME_CATEGORY_PROMO_DEFAULT_TAB: HomeCategoryPromoTabId = 'equipos';
