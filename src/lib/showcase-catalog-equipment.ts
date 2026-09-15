import type { CatalogRow } from '@/lib/catalog-featured';
import { resolveCatalogStock } from '@/lib/catalog-row-lookup';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { usdToPenCharm } from '@/lib/pen-pricing';
import { productPath } from '@/lib/product-path';
import { isPriceOnRequest } from '@/lib/display-price';
import { productHasOfferAttribute } from '@/lib/product-detail-badges';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { inferAdf } from '../../shared/catalog-attribute-filters.js';
import { resolveProductSpeedPpm } from '../../shared/catalog-speed-filter.js';
import {
  formatMonthlyProductionLabel,
  formatPpmLabel,
  inferPpmDigitsFromRicohModelName,
  resolveRicohMonthlyProductionFromModel,
} from '../../shared/ricoh-model-ppm.js';

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
  const inferred = inferAdf(row);
  if (inferred === 'Doble Scan') return 'SPDF';
  if (inferred === 'Estándar') return 'Estándar';
  return undefined;
}

function speedPpmFromName(name: string): string | undefined {
  const fromRicoh = formatPpmLabel(inferPpmDigitsFromRicohModelName(name));
  if (fromRicoh) return fromRicoh;
  const sp = name.match(/\bSP\s*(\d{3,4})/i);
  if (sp?.[1]) return formatPpmLabel(sp[1].slice(0, 2)) ?? undefined;
  const compact = name.match(/\bM\s+(\d{3})(?!\d)/i);
  if (compact?.[1]) return formatPpmLabel(compact[1].slice(0, 2)) ?? undefined;
  return undefined;
}

function speedFromRow(row: CatalogRow): string | undefined {
  const stored = attr(row, 'Velocidad');
  if (stored) return stored;
  const ppm = resolveProductSpeedPpm(row);
  if (ppm != null && Number.isFinite(ppm) && ppm > 0) return `${ppm} ppm`;
  return speedPpmFromName(row.name ?? '');
}

function monthlyYieldFromName(name: string): string | undefined {
  const sp = name.match(/\bSP\s*(\d{3,4})/i);
  const compact = name.match(/\bM\s+(\d{3})(?!\d)/i);
  const block = sp?.[1] ?? compact?.[1];
  if (!block) return undefined;
  const firstDigit = Number(block[0]);
  if (!Number.isFinite(firstDigit) || firstDigit <= 0) return undefined;
  return formatMonthlyProductionLabel(firstDigit * 10_000) ?? undefined;
}

function monthlyYieldFromRow(row: CatalogRow): string | undefined {
  const raw = attr(row, 'Volumen mensual') ?? attr(row, 'Producción mensual');
  if (raw && !/basico|mediano|alta\s*producci/i.test(raw)) {
    const match = raw.match(/(\d[\d.]*)/);
    if (match?.[1]) {
      const pages = Number(match[1].replace(/\./g, ''));
      if (Number.isFinite(pages) && pages > 0) {
        return formatMonthlyProductionLabel(pages) ?? undefined;
      }
    }
  }
  return resolveRicohMonthlyProductionFromModel(row) ?? monthlyYieldFromName(row.name ?? '');
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
      showcaseCategoryIds: ['monitores'],
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
  const classified = classifyShowcase(row);
  if (!classified) return null;
  if (/^LISTA-/i.test(String(row.code ?? '').trim())) return null;

  const isSeminuevo = isSeminuevoCatalogRow(row);
  if (!isSeminuevo && classified.kind !== 'monitor') return null;

  const publicUsd = Number(row.prices?.public ?? 0);
  const pricePen = publicUsd > 0 ? usdToPenCharm(publicUsd, exchangeRate) : 0;
  const slug = String(row.slug ?? row.id ?? '').trim();
  const declaredImage = String(row.image_url ?? '').trim();
  const declaredGallery = (row.gallery ?? []).some((url) => String(url ?? '').trim().length > 0);
  const image = resolveProductImageUrl(row);
  const variantNote = attr(row, 'Variante');
  const isEquipmentKind =
    classified.kind === 'equipment' || classified.kind === 'printer' || classified.kind === 'plotter';
  if (isEquipmentKind && !declaredImage && !declaredGallery) return null;

  const product: HaitechShopProduct = {
    id: row.id,
    name: row.name,
    brand: (row.brand ?? 'RICOH').toUpperCase(),
    stock: resolveCatalogStock(row, row.stock),
    image:
      image ||
      (classified.kind === 'monitor'
        ? '/categories/monitores.png'
        : classified.kind === 'laptop' || classified.kind === 'pc'
          ? '/products/laptop-dell-latitude-3440-i5.webp'
          : '/categories/multifuncionales.png'),
    price: isPriceOnRequest(publicUsd) ? 0 : pricePen,
    tabIds: classified.tabIds,
    condition: isSeminuevo ? 'seminuevo' : 'nuevo',
  };
  if (classified.kind === 'monitor') product.productTypeLabel = 'Monitor';

  if (row.code) product.code = String(row.code).trim();
  if (slug) product.href = productPath(slug);
  if (classified.showcaseCategoryIds) product.showcaseCategoryIds = classified.showcaseCategoryIds;
  if (classified.laptopDevice) product.showcaseLaptopDevice = classified.laptopDevice;
  if (classified.kind === 'pc' || classified.kind === 'laptop') {
    product.showcaseLaptopCpu = /\bi7\b/i.test(row.name) ? 'i7' : 'i5';
  }
  const linkedVariantIds = (row.variant_product_ids ?? []).filter(
    (id): id is string => typeof id === 'string' && id.trim().length > 0,
  );
  if (linkedVariantIds.length > 0) product.variantProductIds = linkedVariantIds;
  if (linkedVariantIds.length > 0) product.hasVariants = true;
  if (variantNote && variantNote !== 'Estándar') product.showcaseVariantLabel = variantNote;
  if (productHasOfferAttribute(row)) product.isOffer = true;

  if (classified.kind === 'equipment' || classified.kind === 'printer' || classified.kind === 'plotter') {
    product.features =
      classified.kind === 'printer'
        ? ['imprime', 'rendimiento']
        : ['copia', 'escanea', 'imprime', 'rendimiento'];
    const speed = speedFromRow(row);
    const paperSize = paperSizeFromRow(row);
    const scannerType = scannerFromRow(row);
    const monthlyYield = monthlyYieldFromRow(row);
    product.equipment = {
      ...(speed ? { speedPpm: speed } : {}),
      ...(paperSize ? { paperSize } : {}),
      ...(scannerType ? { scannerType } : {}),
      ...(monthlyYield ? { monthlyYield } : {}),
    };
  }

  return product;
}

/** Equipos seminuevos y monitores del inventario → cards de vitrina. */
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

function hasUsableShowcasePhoto(product: HaitechShopProduct): boolean {
  const image = product.image?.trim() ?? '';
  if (!image) return false;
  if (image.startsWith('/categories/') || image.startsWith('/promotions/')) return false;
  return true;
}

/** Familias que en vitrina deben verse como una sola card con «Desde». */
function showcaseCollapseModelKey(product: HaitechShopProduct): string | null {
  const name = product.name.toUpperCase();
  if (/\bIM\s*430F\b/.test(name)) return 'IM 430F';
  if (/\bIM\s*550F\b/.test(name)) return 'IM 550F';
  return null;
}

function isIm550fCanonicalCard(product: HaitechShopProduct): boolean {
  if (showcaseCollapseModelKey(product) !== 'IM 550F') return false;
  const name = product.name;
  return (
    /\b220\s*V\b/i.test(name) &&
    !/ligero\s*punto/i.test(name) &&
    !/cilindro/i.test(name)
  );
}

function showcaseVariantRepScore(product: HaitechShopProduct): number {
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  const variant = product.showcaseVariantLabel ?? '';
  const isStandard = !variant || /^est[aá]ndar$/i.test(variant);
  let score = 0;
  if (hasUsableShowcasePhoto(product)) score += 1_000_000;
  if (stock > 0) score += 100_000;
  if (isIm550fCanonicalCard(product)) score += 500_000;
  score -= Math.max(0, product.price);
  if (isStandard) score += 50;
  if (/\b220\s*V\b/i.test(product.name)) score += 10;
  return score;
}

/**
 * Una sola card por familia de variantes. El representante es el más barato
 * con foto y stock; muestra «Desde» si hay más de una opción.
 */
export function collapseShowcaseEquipmentVariants(
  products: readonly HaitechShopProduct[],
): HaitechShopProduct[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const parent = new Map<string, string>();

  const find = (id: string): string => {
    const current = parent.get(id) ?? id;
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };

  const union = (left: string, right: string) => {
    const a = find(left);
    const b = find(right);
    if (a !== b) parent.set(a, b);
  };

  const byModel = new Map<string, string>();
  for (const product of products) {
    if (!parent.has(product.id)) parent.set(product.id, product.id);
    for (const linkedId of product.variantProductIds ?? []) {
      if (!byId.has(linkedId)) continue;
      union(product.id, linkedId);
    }
    const modelKey = showcaseCollapseModelKey(product);
    if (!modelKey || product.condition !== 'seminuevo') continue;
    const family = `${product.condition}:${modelKey}`;
    const seen = byModel.get(family);
    if (seen) union(product.id, seen);
    else byModel.set(family, product.id);
  }

  const groups = new Map<string, HaitechShopProduct[]>();
  for (const product of products) {
    const root = find(product.id);
    const list = groups.get(root) ?? [];
    list.push(product);
    groups.set(root, list);
  }

  const collapsed: HaitechShopProduct[] = [];
  for (const group of groups.values()) {
    const ranked = [...group].sort(
      (left, right) => showcaseVariantRepScore(right) - showcaseVariantRepScore(left),
    );
    const winner = ranked[0]!;
    const linkedOutsideGrid = (winner.variantProductIds ?? []).some((id) => !byId.has(id));
    const variantLabel = winner.showcaseVariantLabel?.trim();
    const collapsedWinner: HaitechShopProduct = {
      ...winner,
      hasVariants: group.length > 1 || linkedOutsideGrid || isIm550fCanonicalCard(winner),
    };
    if (
      variantLabel &&
      winner.name.toLowerCase().includes(variantLabel.toLowerCase())
    ) {
      delete collapsedWinner.showcaseVariantLabel;
    }
    collapsed.push(collapsedWinner);
  }

  return collapsed;
}
