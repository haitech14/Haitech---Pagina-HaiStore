import type { StoreRicohPromoBanner } from '@/data/store-ricoh-promo-banners';

export type HomeCategoryShowcaseCategoryCard = {
  id: string;
  label: string;
  image: string;
  imageAlt?: string;
  href: string;
};

export type HomeCategoryShowcasePromo = {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  pricePen?: number;
  priceLabel?: string;
  image: string;
  imageAlt?: string;
  href: string;
  ctaLabel?: string;
  gradientFrom?: string;
  gradientTo?: string;
  variant?: 'dark' | 'blue';
};

export type HomeCategoryShowcaseProduct = {
  id: string;
  name: string;
  brand?: string | null;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  image: string;
  href: string;
  bestSeller?: boolean;
  /** ID de catálogo para enriquecer precio, stock e imagen en tiempo de ejecución. */
  catalogId?: string;
  category?: string;
};

export type HomeCategoryShowcaseConfig = {
  id: string;
  title: string;
  promo?: HomeCategoryShowcasePromo;
  /** Banners gráficos completos (sustituyen el promo construido en UI). */
  promoBanners?: StoreRicohPromoBanner[];
  categories: HomeCategoryShowcaseCategoryCard[];
  products: HomeCategoryShowcaseProduct[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Grid compacto de categorías (3 o 4 columnas, debajo del promo). */
  categoryColumns?: 3 | 4;
  /** Promo a la izquierda y subcategorías a la derecha (mockup Impresoras). */
  showcaseLayout?: 'default' | 'split' | 'categories-grid';
  /** Tarjeta vertical (card) u horizontal con imagen a la izquierda (row). */
  categoryTileVariant?: 'card' | 'row';
  /** Columnas del grid de subcategorías en layout split. */
  categoryGridColumns?: 2 | 3;
  /** Banner promocional compacto o ancho estilo mockup. */
  promoVariant?: 'compact' | 'wide';
  /** Split más bajo (~⅓ de altura) con promo horizontal y categorías densas. */
  splitDensity?: 'default' | 'compact';
};

/** Alias para compatibilidad con imports existentes. */
export type HomeCategoryShowcaseTile = HomeCategoryShowcaseCategoryCard;

/** @deprecated Usar `HomeCategoryShowcaseConfig`. */
export type HomeCategoryShowcaseLegacyPromo = {
  eyebrow?: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage?: string;
};

/** @deprecated Usar `HomeCategoryShowcaseConfig`. */
export type HomeCategoryShowcaseSectionConfig = {
  sectionId: string;
  title: string;
  promo: HomeCategoryShowcaseLegacyPromo;
  categories: HomeCategoryShowcaseCategoryCard[];
  products: import('@/data/home-best-sellers').HomeBestSellerProduct[];
};

export function adaptLegacyShowcaseConfig(
  legacy: HomeCategoryShowcaseSectionConfig,
): HomeCategoryShowcaseConfig {
  return {
    id: legacy.sectionId,
    title: legacy.title,
    promo: {
      ...(legacy.promo.eyebrow ? { eyebrow: legacy.promo.eyebrow } : {}),
      headline: legacy.promo.title,
      ctaLabel: legacy.promo.ctaLabel,
      href: legacy.promo.ctaHref,
      image: legacy.promo.backgroundImage ?? '/categories/computadoras-laptop.png',
    },
    categories: legacy.categories,
    products: legacy.products.map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      oldPrice: product.oldPrice,
      discountPercent: product.discountPercent,
      image: product.image,
      href: product.href,
      bestSeller: true,
      category: 'Equipos',
    })),
  };
}
