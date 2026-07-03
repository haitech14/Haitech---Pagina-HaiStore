export interface Brand {
  name: string;
  logo: string;
  /** Dimensiones nativas del archivo (referencia / `width`/`height` en `<img>`). */
  logoWidth?: number;
  logoHeight?: number;
  /** Clases Tailwind para normalizar el tamaño en la franja de marcas. */
  logoClassName?: string;
}

/** Clase por defecto para logos horizontales en la franja de marcas (footer claro, a color). */
export const DEFAULT_BRAND_LOGO_CLASS =
  'max-h-7 w-auto max-w-full object-contain sm:max-h-8 md:max-h-9';

export const brands: string[] = [
  'Apple',
  'Samsung',
  'Sony',
  'ASUS',
  'JBL',
  'Logitech',
  'Xiaomi',
  'acer',
  'HP',
  'Dell',
];

export const printerBrands: Brand[] = [
  {
    name: 'Ricoh',
    logo: '/brands/ricoh.png',
    logoWidth: 390,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[5rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Konica Minolta',
    logo: '/brands/konica-minolta.png',
    logoWidth: 138,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[3.75rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Canon',
    logo: '/brands/canon.png',
    logoWidth: 213,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[4.25rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Epson',
    logo: '/brands/epson.png',
    logoWidth: 325,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[5rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'HP',
    logo: '/brands/hp.png',
    logoWidth: 80,
    logoHeight: 80,
    logoClassName: 'h-7 w-7 object-contain sm:h-8 sm:w-8 md:h-9 md:w-9',
  },
  {
    name: 'Kyocera',
    logo: '/brands/kyocera.png',
    logoWidth: 319,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[5rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Lexmark',
    logo: '/brands/lexmark.png',
    logoWidth: 406,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[5.25rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Oki',
    logo: '/brands/oki.png',
    logoWidth: 182,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[3.25rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Pantum',
    logo: '/brands/pantum.png',
    logoWidth: 311,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[5rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Colortrac',
    logo: '/brands/colortrac.png',
    logoWidth: 297,
    logoHeight: 80,
    logoClassName: 'max-h-7 w-auto max-w-[4.5rem] object-contain sm:max-h-8 md:max-h-9',
  },
  {
    name: 'Ramko',
    logo: '/brands/ramko.png',
    logoWidth: 225,
    logoHeight: 225,
    logoClassName: 'h-7 w-auto max-w-[2.75rem] object-contain sm:h-8 sm:max-w-[3.25rem] md:h-9',
  },
  {
    name: 'Topjet',
    logo: '/brands/topjet.png',
    logoWidth: 320,
    logoHeight: 128,
    logoClassName: 'max-h-7 w-auto max-w-[4.25rem] object-contain sm:max-h-8 md:max-h-9 sm:max-w-[4.25rem]',
  },
  {
    name: 'Densitone',
    logo: '/brands/densitone.png',
    logoWidth: 320,
    logoHeight: 320,
    logoClassName: 'h-7 w-auto max-w-[2.75rem] object-contain sm:h-8 sm:max-w-[3rem] md:h-9',
  },
  {
    name: 'Intercopy',
    logo: '/brands/intercopy.png',
    logoWidth: 320,
    logoHeight: 122,
    logoClassName: 'max-h-7 w-auto max-w-[4.75rem] object-contain sm:max-h-8 md:max-h-9 sm:max-w-[5.25rem]',
  },
  {
    name: 'Katun',
    logo: '/brands/katun.png',
    logoWidth: 320,
    logoHeight: 86,
    logoClassName: 'max-h-7 w-auto max-w-[5rem] object-contain sm:max-h-8 md:max-h-9',
  },
];

/** Marcas bajo el hero de la home (franja compacta). */
export const HERO_PARTNER_BRAND_NAMES = [
  'Ricoh',
  'Canon',
  'Epson',
  'HP',
  'Konica Minolta',
  'Kyocera',
  'Lexmark',
  'Pantum',
  'Oki',
] as const;

export const heroPartnerBrands: Brand[] = HERO_PARTNER_BRAND_NAMES.flatMap((name) => {
  const brand = printerBrands.find((item) => item.name === name);
  return brand ? [brand] : [];
});

/** Marcas del carrusel «Trabajamos con las mejores marcas» (home). */
const FOOTER_PARTNER_BRAND_NAMES = [
  'Ricoh',
  'Pantum',
  'Colortrac',
  'Ramko',
  'Topjet',
  'Densitone',
  'Intercopy',
  'Katun',
  'Konica Minolta',
] as const;

export const footerPartnerBrands: Brand[] = FOOTER_PARTNER_BRAND_NAMES.flatMap((name) => {
  const brand = printerBrands.find((item) => item.name === name);
  return brand ? [brand] : [];
});

export type BrandItem = string | Brand;

export function getBrandName(brand: BrandItem): string {
  return typeof brand === 'string' ? brand : brand.name;
}

export function getBrandLogo(brand: BrandItem): string | undefined {
  return typeof brand === 'string' ? undefined : brand.logo;
}

export function getBrandLogoClassName(brand: BrandItem): string {
  if (typeof brand === 'string') return DEFAULT_BRAND_LOGO_CLASS;
  return brand.logoClassName ?? DEFAULT_BRAND_LOGO_CLASS;
}

export function getBrandLogoDimensions(
  brand: BrandItem,
): { width?: number; height?: number } {
  if (typeof brand === 'string') return {};
  const dimensions: { width?: number; height?: number } = {};
  if (brand.logoWidth != null) dimensions.width = brand.logoWidth;
  if (brand.logoHeight != null) dimensions.height = brand.logoHeight;
  return dimensions;
}

export function getBrandSlug(brand: BrandItem): string {
  return getBrandName(brand)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

export function getBrandFilterHref(brand: BrandItem): string {
  return `/tienda?marca=${getBrandSlug(brand)}`;
}

export function findBrandBySlug(slug: string | null | undefined): Brand | undefined {
  if (!slug) return undefined;
  return printerBrands.find((brand) => getBrandSlug(brand) === slug);
}

export function productMatchesBrand(
  productBrand: string | null | undefined,
  marcaSlug: string | null | undefined,
): boolean {
  if (!marcaSlug) return true;
  if (!productBrand) return false;
  return getBrandSlug({ name: productBrand, logo: '' }) === marcaSlug;
}
