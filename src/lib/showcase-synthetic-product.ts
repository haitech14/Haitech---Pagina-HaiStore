import {
  listShowcaseEquipmentProducts,
  resolveShowcaseEquipmentTecnicoUsd,
} from '@/data/haitech-home-equipment-showcase';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { toPublicProduct } from '@/lib/pricing';
import { deriveProductSlug } from '@/lib/product-slug';
import { ensureFullPrices } from '@/lib/roles';
import { penToUsd } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';

function normalizeLookup(key: string | null | undefined): string {
  return String(key ?? '')
    .trim()
    .toLowerCase();
}

/** Busca un producto de vitrina por id, código o slug derivado. */
export function findShowcaseShopProductByLookupKey(
  lookupKey: string | null | undefined,
): HaitechShopProduct | undefined {
  const lower = normalizeLookup(lookupKey);
  if (!lower) return undefined;

  return listShowcaseEquipmentProducts().find((product) => {
    if (product.id.toLowerCase() === lower) return true;
    if (product.code && product.code.toLowerCase() === lower) return true;
    const slug = deriveProductSlug({ id: product.id, name: product.name });
    return slug.toLowerCase() === lower;
  });
}

function buildShowcaseAttributes(product: HaitechShopProduct): InventoryProduct['attributes'] {
  const attrs: NonNullable<InventoryProduct['attributes']> = [];
  const eq = product.equipment;
  if (eq?.speedPpm) attrs.push({ name: 'Velocidad', value: eq.speedPpm });
  if (eq?.paperSize) attrs.push({ name: 'Formato', value: eq.paperSize });
  if (eq?.scannerType) attrs.push({ name: 'Alimentador', value: eq.scannerType });
  if (eq?.monthlyYield) attrs.push({ name: 'Volumen mensual', value: eq.monthlyYield });
  if (/remanufactur/i.test(product.name)) {
    attrs.push({ name: 'Condición', value: 'Remanufacturada' });
  } else if (product.condition === 'seminuevo') {
    attrs.push({ name: 'Condición', value: 'Seminueva' });
  } else if (product.equipment) {
    attrs.push({ name: 'Condición', value: 'Nueva' });
  }
  return attrs;
}

function resolveShowcaseCategory(product: HaitechShopProduct): string {
  if (/remanufactur/i.test(product.name)) {
    if (/impresora/i.test(product.name) && !/multifuncional/i.test(product.name)) {
      return 'Impresoras, Impresoras Remanufacturadas';
    }
    return 'Multifuncionales, Multifuncionales Remanufacturadas';
  }
  if (product.condition === 'seminuevo') {
    return 'Multifuncionales, Multifuncionales Seminuevas';
  }
  if (product.tabIds.includes('impresoras')) return 'Impresoras';
  if (product.showcaseCategoryIds?.includes('formato-ancho')) return 'Formato Ancho';
  if (product.showcaseCategoryIds?.includes('laptops')) return 'Laptops';
  return 'Multifuncionales';
}

/** Convierte un ítem de vitrina en producto de inventario (ficha / API). */
export function showcaseShopProductToInventoryProduct(
  product: HaitechShopProduct,
): InventoryProduct {
  const tecnicoUsd = resolveShowcaseEquipmentTecnicoUsd(product);
  const publicFromPen = penToUsd(product.price, DEFAULT_USD_TO_PEN);
  const isReman = /remanufactur/i.test(product.name);
  const publicUsd =
    publicFromPen > 0
      ? Math.round(publicFromPen * 100) / 100
      : tecnicoUsd != null && tecnicoUsd > 0
        ? isReman
          ? tecnicoUsd + 100
          : tecnicoUsd
        : 0;

  const prices = ensureFullPrices({
    public: publicUsd,
    ...(tecnicoUsd != null && tecnicoUsd > 0 ? { tecnico: tecnicoUsd } : {}),
  });

  const image = product.image?.trim() || null;
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));

  return normalizeInventoryProduct({
    id: product.id,
    code: product.code ?? product.id.toUpperCase().replace(/-/g, ''),
    slug: deriveProductSlug({ id: product.id, name: product.name }),
    name: product.name,
    description: `${product.name}. Equipo disponible desde la vitrina HaiStore.`,
    currency: 'USD',
    stock,
    stock_by_warehouse: stock > 0 ? [{ warehouse_id: 'principal', quantity: stock }] : [],
    category: resolveShowcaseCategory(product),
    brand: product.brand ?? 'RICOH',
    image_url: image,
    gallery: image ? [image] : [],
    purchase_price_usd: 0,
    suppliers: [],
    attachments: [],
    attributes: buildShowcaseAttributes(product),
    created_at: new Date().toISOString(),
    sort_order: 0,
    status: 'activa',
    prices,
  });
}

/** Ficha pública sintética desde vitrina cuando no hay fila en inventario. */
export function resolveShowcaseSyntheticProduct(
  lookupKey: string | null | undefined,
  role: string = 'public',
): Product | undefined {
  const shop = findShowcaseShopProductByLookupKey(lookupKey);
  if (!shop) return undefined;
  return toPublicProduct(showcaseShopProductToInventoryProduct(shop), role);
}
