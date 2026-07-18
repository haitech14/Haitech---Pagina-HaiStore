import { subcategoryVisualKind } from '@/lib/subcategory-visual';

/** Imágenes curadas para banners y tarjetas de subcategoría. */
const STOCK_BY_KIND: Partial<Record<ReturnType<typeof subcategoryVisualKind>, string>> = {
  all: '/promotions/promo-hero-multifuncionales.png',
  new: '/categories/subcategories/equipo-nuevo.png',
  preowned: '/categories/subcategories/equipo-seminuevo.png',
  refurbished: '/categories/subcategories/equipo-remanufacturado.png',
  supplies: '/categories/toner-suministros.png',
  default: '/promo-cards/b2b-printer.png',
};

const STOCK_BY_SLUG: Record<string, string> = {
  'multifuncionales-nuevas': '/categories/subcategories/equipo-nuevo.png',
  'multifuncionales-nueva': '/categories/subcategories/equipo-nuevo.png',
  'multifuncionales-seminuevas': '/categories/subcategories/equipo-seminuevo.png',
  'multifuncionales-seminueva': '/categories/subcategories/equipo-seminuevo.png',
  'multifuncionales-remanufacturadas': '/categories/subcategories/equipo-remanufacturado.png',
  'multifuncionales-remanufacturada': '/categories/subcategories/equipo-remanufacturado.png',
  'impresoras-laser-nuevas': '/categories/subcategories/equipo-nuevo.png',
  'impresoras-laser-seminuevas': '/categories/subcategories/equipo-seminuevo.png',
  'impresoras-laser-remanufacturadas': '/categories/subcategories/equipo-remanufacturado.png',
  'impresoras-termicas': '/home/category-chips/equipment/impresora-termica.webp',
  'impresoras-nuevas': '/categories/subcategories/equipo-nuevo.png',
  'impresoras-seminuevas': '/categories/subcategories/equipo-seminuevo.png',
  'impresoras-remanufacturadas': '/categories/subcategories/equipo-remanufacturado.png',
  'toner-compatibles': '/categories/toner-suministros.png',
  'toner-originales': '/categories/accesorios-impresoras.png',
  'toner-remanufacturado': '/categories/toner-suministros.png',
  'toner-recarga': '/categories/toner-suministros.png',
};

function slugPatternStockImage(slug: string): string | null {
  const norm = slug.toLowerCase();

  if (norm.includes('seminueva') || norm.includes('seminuevo') || norm.includes('usad')) {
    return STOCK_BY_KIND.preowned ?? null;
  }
  if (norm.includes('remanufactur') || norm.includes('reacondicion')) {
    return STOCK_BY_KIND.refurbished ?? null;
  }
  if (norm.endsWith('-nuevas') || norm.endsWith('-nueva') || norm.endsWith('-nuevos')) {
    return STOCK_BY_KIND.new ?? null;
  }

  return null;
}

export function subcategoryStockImage(name: string, slug: string): string | null {
  const bySlug = STOCK_BY_SLUG[slug.toLowerCase()];
  if (bySlug) return bySlug;

  const byPattern = slugPatternStockImage(slug);
  if (byPattern) return byPattern;

  const kind = subcategoryVisualKind(name);
  return STOCK_BY_KIND[kind] ?? STOCK_BY_KIND.default ?? null;
}
