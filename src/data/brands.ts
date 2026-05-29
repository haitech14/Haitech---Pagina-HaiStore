export interface Brand {
  name: string;
  logo: string;
}

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
  { name: 'Ricoh', logo: '/brands/ricoh.png' },
  { name: 'Konica Minolta', logo: '/brands/konica-minolta.png' },
  { name: 'Canon', logo: '/brands/canon.png' },
  { name: 'Epson', logo: '/brands/epson.png' },
  { name: 'HP', logo: '/brands/hp.png' },
  { name: 'Kyocera', logo: '/brands/kyocera.png' },
  { name: 'Lexmark', logo: '/brands/lexmark.png' },
  { name: 'Oki', logo: '/brands/oki.png' },
  { name: 'Pantum', logo: '/brands/pantum.png' },
  { name: 'Colortrac', logo: '/brands/colortrac.png' },
];

export type BrandItem = string | Brand;

export function getBrandName(brand: BrandItem): string {
  return typeof brand === 'string' ? brand : brand.name;
}

export function getBrandLogo(brand: BrandItem): string | undefined {
  return typeof brand === 'string' ? undefined : brand.logo;
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
