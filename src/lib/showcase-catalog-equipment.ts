import type { CatalogRow } from '@/lib/catalog-featured';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { usdToPenCharm } from '@/lib/pen-pricing';
import { productPath } from '@/lib/product-path';
import { isPriceOnRequest } from '@/lib/display-price';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';

function attr(row: CatalogRow, name: string): string | null {
  const value = row.attributes?.find(
    (item) => String(item.name ?? '').trim().toLowerCase() === name.toLowerCase(),
  )?.value;
  return value?.trim() ? String(value).trim() : null;
}

function haystackOf(row: CatalogRow): string {
  return `${row.category ?? ''} ${row.name ?? ''}`.toLowerCase();
}

function isSeminuevoCatalogRow(row: CatalogRow): boolean {
  return /seminuev/.test(haystackOf(row));
}

function paperSizeFromRow(
  row: CatalogRow,
): 'A4' | 'A3' | 'A4 / A3' | 'A0' | 'A1' | undefined {
  const raw = attr(row, 'Formato papel') ?? '';
  if (/a4\s*\/\s*a3/i.test(raw)) return 'A4 / A3';
  if (/\ba3\b/i.test(raw)) return 'A3';
  if (/\ba4\b/i.test(raw)) return 'A4';
  if (/\ba0\b/i.test(raw) || /ancho/i.test(raw)) return 'A0';
  if (/\ba1\b/i.test(raw)) return 'A1';
  return undefined;
}

function scannerFromRow(row: CatalogRow): 'ARDF' | 'SPDF' | 'Estándar' | undefined {
  const raw = attr(row, 'Alimentador (ADF)') ?? attr(row, 'Alimentador') ?? '';
  if (/doble\s*scan|spdf/i.test(raw)) return 'SPDF';
  if (/ardf/i.test(raw)) return 'ARDF';
  if (raw) return 'Estándar';
  return undefined;
}

function classifyShowcase(row: CatalogRow): {
  tabIds: HaitechShopProduct['tabIds'];
  showcaseCategoryIds?: HaitechShopProduct['showcaseCategoryIds'];
  laptopDevice?: 'pc' | 'laptop';
  kind: 'equipment' | 'printer' | 'plotter' | 'accessory' | 'laptop' | 'pc' | 'monitor';
} | null {
  const haystack = haystackOf(row);
  const category = String(row.category ?? '').toLowerCase();

  if (/accesorio/.test(category) || /mueble|casetera|cassetera/.test(haystack)) {
    return { tabIds: ['accesorios'], showcaseCategoryIds: ['accesorios'], kind: 'accessory' };
  }
  if (/monitor/.test(haystack) || /monitores/.test(category)) {
    return {
      tabIds: ['ofertas'],
      showcaseCategoryIds: ['laptops', 'monitores'],
      kind: 'monitor',
    };
  }
  if (/\blaptop\b|\bnotebook\b/.test(haystack) || /laptops seminuevas/.test(category)) {
    return {
      tabIds: ['ofertas'],
      showcaseCategoryIds: ['laptops'],
      laptopDevice: 'laptop',
      kind: 'laptop',
    };
  }
  if (/optiplex|\bpc\b|computadora/.test(haystack) || /computadoras seminuevas/.test(category)) {
    return {
      tabIds: ['ofertas'],
      showcaseCategoryIds: ['laptops'],
      laptopDevice: 'pc',
      kind: 'pc',
    };
  }
  if (/formato ancho|plotter|cw2200|cw2201/.test(haystack)) {
    return {
      tabIds: ['multifuncionales'],
      showcaseCategoryIds: ['formato-ancho'],
      kind: 'plotter',
    };
  }
  if (/impresoras laser|impresoras láser/.test(category) || (/\bimpresora\b/.test(haystack) && /dn\b/.test(haystack) && !/multifuncional/.test(haystack))) {
    return { tabIds: ['impresoras'], kind: 'printer' };
  }
  if (/multifuncional/.test(haystack) || /multifuncionales/.test(category)) {
    return { tabIds: ['multifuncionales'], kind: 'equipment' };
  }
  return null;
}

function catalogRowToEquipmentShowcase(
  row: CatalogRow,
  exchangeRate: number,
): HaitechShopProduct | null {
  if (!isSeminuevoCatalogRow(row)) return null;
  const classified = classifyShowcase(row);
  if (!classified) return null;

  const publicUsd = Number(row.prices?.public ?? 0);
  const pricePen = publicUsd > 0 ? usdToPenCharm(publicUsd, exchangeRate) : 0;
  const slug = String(row.slug ?? row.id ?? '').trim();
  const image = resolveProductImageUrl(row);
  const variantNote = attr(row, 'Variante');
  const hasVariants = (row.variant_product_ids?.length ?? 0) > 0 || Boolean(variantNote && variantNote !== 'Estándar');

  const product: HaitechShopProduct = {
    id: row.id,
    name: row.name,
    brand: (row.brand ?? 'RICOH').toUpperCase(),
    stock: Math.max(0, Math.floor(Number(row.stock) || 0)),
    image:
      image ||
      (classified.kind === 'monitor'
        ? '/categories/monitores.png'
        : classified.kind === 'laptop' || classified.kind === 'pc'
          ? '/products/laptop-dell-latitude-3440-i5.webp'
          : '/categories/multifuncionales.png'),
    price: isPriceOnRequest(publicUsd) ? 0 : pricePen,
    tabIds: classified.tabIds,
    condition: 'seminuevo',
  };

  if (row.code) product.code = String(row.code).trim();
  if (slug) product.href = productPath(slug);
  if (classified.showcaseCategoryIds) product.showcaseCategoryIds = classified.showcaseCategoryIds;
  if (classified.laptopDevice) product.showcaseLaptopDevice = classified.laptopDevice;
  if (classified.kind === 'pc' || classified.kind === 'laptop') {
    product.showcaseLaptopCpu = /\bi7\b/i.test(row.name) ? 'i7' : 'i5';
  }
  if (hasVariants) product.hasVariants = true;
  if (variantNote && variantNote !== 'Estándar') product.showcaseVariantLabel = variantNote;

  if (classified.kind === 'equipment' || classified.kind === 'printer' || classified.kind === 'plotter') {
    product.features =
      classified.kind === 'printer'
        ? ['imprime', 'rendimiento']
        : ['copia', 'escanea', 'imprime', 'rendimiento'];
    const speed = attr(row, 'Velocidad');
    const paperSize = paperSizeFromRow(row);
    const scannerType = scannerFromRow(row);
    product.equipment = {
      ...(speed ? { speedPpm: speed } : {}),
      ...(paperSize ? { paperSize } : {}),
      ...(scannerType ? { scannerType } : {}),
    };
  }

  return product;
}

/** Equipos seminuevos del inventario → cards de vitrina (misma ficha que tienda). */
export function buildShowcaseEquipmentFromCatalog(
  rows: readonly CatalogRow[],
  exchangeRate: number,
): HaitechShopProduct[] {
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return [];

  const products: HaitechShopProduct[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const product = catalogRowToEquipmentShowcase(row, exchangeRate);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
  }

  return products;
}
