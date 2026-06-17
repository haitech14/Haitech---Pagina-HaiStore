import { isPrinterEquipment } from '@/lib/build-product-detail';
import { buildProductImageCandidates } from '@/lib/product-image-url';
import { ensureFullPrices } from '@/lib/roles';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';
import { usdToPen } from '@/lib/utils';

const TONER_STOCK_IMAGE = '/categories/toner-suministros.png';
const IM430F_TONER_CATALOG_ID = 'toner-419078';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isIm430fEquipment(equipment: Product): boolean {
  if (equipment.id === 'ricoh-im-430f') return true;
  return /\bim\s*430f\b/i.test(equipment.name);
}

function isConsumableProduct(product: Product): boolean {
  const haystack = normalizeText(
    `${product.category ?? ''} ${product.name} ${product.description ?? ''}`,
  );

  if (haystack.includes('impresora') || haystack.includes('multifuncional')) {
    return false;
  }

  return (
    haystack.includes('toner') ||
    haystack.includes('cartucho') ||
    haystack.includes('suministro') ||
    haystack.includes('tambor') ||
    haystack.includes('unidad de imagen') ||
    haystack.includes('repuesto')
  );
}

function extractSearchKeys(equipment: Product): string[] {
  const keys = new Set<string>();
  const name = equipment.name;

  const regexes = [
    /\bIM\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\bIM\s+\d{3,4}[A-Z]?\b/gi,
    /\bMP\s*C?\s*\d{3,4}[A-Z]?\b/gi,
    /\b[A-Z]{1,5}\s*-?\s*\d{3,4}[A-Z]{0,4}\b/g,
    /\b[A-Z]{1,5}\d{3,4}[A-Z]{0,4}\b/g,
  ];

  for (const pattern of regexes) {
    for (const match of name.matchAll(pattern)) {
      const raw = match[0].trim();
      keys.add(normalizeText(raw));
      keys.add(raw.replace(/\s+/g, '').toLowerCase());
    }
  }

  const withoutBrand = equipment.brand
    ? name.replace(new RegExp(equipment.brand, 'i'), '').trim()
    : name.trim();
  if (withoutBrand.length >= 4) {
    keys.add(normalizeText(withoutBrand));
    keys.add(withoutBrand.replace(/\s+/g, '').toLowerCase());
  }

  keys.add(equipment.id.replace(/-/g, ' '));

  return [...keys].filter((key) => key.replace(/\s+/g, '').length >= 3);
}

function consumableMatchesEquipment(consumable: Product, keys: string[]): boolean {
  const haystack = normalizeText(`${consumable.name} ${consumable.description ?? ''}`);
  const compactHaystack = haystack.replace(/\s+/g, '');

  return keys.some((key) => {
    const compactKey = key.replace(/\s+/g, '');
    if (compactKey.length < 3) return false;
    return haystack.includes(key) || compactHaystack.includes(compactKey);
  });
}

function isMisassignedEquipmentImage(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url === '/products/ricoh-im-430f.webp' ||
    url === '/products/ricoh-im-430f.png' ||
    url.startsWith('/categories/multifuncionales') ||
    url.startsWith('/categories/impresoras') ||
    url.startsWith('/promo-cards/b2b-printer')
  );
}

function resolveComboConsumableImage(product: Product, fallback = TONER_STOCK_IMAGE): string {
  const candidate = buildProductImageCandidates(product)[0];
  if (candidate && !isMisassignedEquipmentImage(candidate)) return candidate;
  return fallback;
}

function productToComboItem(product: Product, defaultSelected: boolean): ProductComboItem {
  const image = resolveComboConsumableImage(product);
  return {
    id: product.id,
    productId: product.id,
    name: product.name,
    image,
    pricePen: usdToPen(product.price),
    priceUsd: product.price,
    defaultSelected,
  };
}

interface CuratedAccessory {
  id: string;
  name: string;
  priceUsd: number;
  fallbackImage: string;
  defaultSelected: boolean;
  matchPatterns: RegExp[];
}

const IM430F_CURATED_ACCESSORIES: CuratedAccessory[] = [
  {
    id: 'combo-toner-cartucho-im430f',
    name: 'Toner Cartucho RICOH IM 430F',
    priceUsd: 68,
    fallbackImage: '/products/toner-419078.webp',
    defaultSelected: true,
    matchPatterns: [
      /cartucho.*im\s*430/i,
      /toner.*im\s*430/i,
      /print cartridge im\s*430/i,
    ],
  },
];

function matchesCuratedAccessory(product: Product, accessory: CuratedAccessory): boolean {
  const haystack = normalizeText(`${product.name} ${product.description ?? ''} ${product.category ?? ''}`);
  return accessory.matchPatterns.some((pattern) => pattern.test(haystack));
}

function resolveCatalogPublicUsd(product: Product): number {
  return product.prices ? ensureFullPrices(product.prices).public : product.price;
}

function findCuratedCatalogMatch(accessory: CuratedAccessory, catalog: Product[]): Product | undefined {
  if (accessory.id === 'combo-toner-cartucho-im430f') {
    const preferred = catalog.find((row) => row.id === IM430F_TONER_CATALOG_ID);
    if (preferred) return preferred;
  }

  return catalog.find((row) => matchesCuratedAccessory(row, accessory));
}

function buildCuratedComboItem(accessory: CuratedAccessory, catalog: Product[]): ProductComboItem {
  const matched = findCuratedCatalogMatch(accessory, catalog);
  const linkedProduct =
    accessory.id === 'combo-toner-cartucho-im430f' && matched?.id === IM430F_TONER_CATALOG_ID
      ? matched
      : matched && Math.abs(resolveCatalogPublicUsd(matched) - accessory.priceUsd) < 0.01
        ? matched
        : undefined;

  return {
    id: linkedProduct?.id ?? accessory.id,
    ...(linkedProduct ? { productId: linkedProduct.id } : {}),
    name: accessory.name,
    image: accessory.fallbackImage,
    pricePen: usdToPen(accessory.priceUsd),
    priceUsd: accessory.priceUsd,
    defaultSelected: accessory.defaultSelected,
  };
}

function resolveIm430fFrequentlyBought(_equipment: Product, catalog: Product[]): ProductComboItem[] {
  return IM430F_CURATED_ACCESSORIES.map((item) => buildCuratedComboItem(item, catalog));
}

export function resolveFrequentlyBoughtItems(
  equipment: Product,
  catalog: Product[],
): ProductComboItem[] {
  if (!isPrinterEquipment(equipment)) return [];

  if (isIm430fEquipment(equipment)) {
    return resolveIm430fFrequentlyBought(equipment, catalog);
  }

  const keys = extractSearchKeys(equipment);
  const matched = catalog
    .filter((row) => row.id !== equipment.id)
    .filter(isConsumableProduct)
    .filter((row) => consumableMatchesEquipment(row, keys))
    .slice(0, 6);

  if (matched.length > 0) {
    return matched.map((row, index) => productToComboItem(row, index === 0));
  }

  const brand = (equipment.brand ?? '').toLowerCase();
  if (brand) {
    const brandToners = catalog
      .filter((row) => row.id !== equipment.id)
      .filter(isConsumableProduct)
      .filter((row) => (row.brand ?? '').toLowerCase() === brand)
      .filter((row) => {
        const name = normalizeText(row.name);
        return name.includes('toner') || name.includes('cartucho');
      })
      .slice(0, 3);

    if (brandToners.length > 0) {
      return brandToners.map((row, index) => productToComboItem(row, index === 0));
    }
  }

  return [];
}
