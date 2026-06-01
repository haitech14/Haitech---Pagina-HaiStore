import { subcategoryVisualKind } from '@/lib/subcategory-visual';

/** Imágenes de producto/equipo cuando el inventario aún no tiene foto en la subcategoría. */
const STOCK_BY_KIND: Partial<Record<ReturnType<typeof subcategoryVisualKind>, string>> = {
  new: '/products/ricoh-im-430f.png',
  refurbished: '/promotions/promo-hero-multifuncionales.png',
  supplies: '/categories/toner-suministros.png',
  default: '/promo-cards/b2b-printer.png',
};

const STOCK_BY_SLUG: Record<string, string> = {
  'multifuncionales-nuevas': '/products/ricoh-im-430f.png',
  'multifuncionales-nueva': '/products/ricoh-im-430f.png',
  'multifuncionales-remanufacturadas': '/promotions/promo-hero-multifuncionales.png',
  'multifuncionales-remanufacturada': '/promotions/promo-hero-multifuncionales.png',
};

export function subcategoryStockImage(name: string, slug: string): string | null {
  const bySlug = STOCK_BY_SLUG[slug.toLowerCase()];
  if (bySlug) return bySlug;

  const kind = subcategoryVisualKind(name);
  return STOCK_BY_KIND[kind] ?? STOCK_BY_KIND.default ?? null;
}
