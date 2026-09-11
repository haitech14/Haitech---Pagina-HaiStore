import { listShowcaseEquipmentProducts } from '@/data/haitech-home-equipment-showcase';
import { featuredToProduct } from '@/data/featured-products';
import { type HaitechShopProduct } from '@/data/haitech-home-shop';
import { catalogRowToFeatured, getCatalogRows, type CatalogRow } from '@/lib/catalog-featured';
import { isPriceOnRequest } from '@/lib/display-price';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { usdToPenCharm } from '@/lib/pen-pricing';
import { productHasOfferAttribute } from '@/lib/product-detail-badges';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { productPath } from '@/lib/product-path';
import { findShowcaseCatalogRow } from '@/lib/showcase-product-href';
import { resolveShowcaseSyntheticProduct } from '@/lib/showcase-synthetic-product';
import type { Product } from '@/types/product';

const DEFAULT_LIMIT = 12;

function inferShopCondition(row: CatalogRow): HaitechShopProduct['condition'] | undefined {
  const haystack = `${row.category ?? ''} ${row.name ?? ''}`.toLowerCase();
  if (haystack.includes('seminuev')) return 'seminuevo';
  if (haystack.includes('remanufactur')) return 'seminuevo';
  if (haystack.includes('nuev')) return 'nuevo';
  return undefined;
}

function inferProductTypeLabel(row: CatalogRow): string | undefined {
  const haystack = `${row.category ?? ''} ${row.name ?? ''}`.toLowerCase();
  if (haystack.includes('multifuncional')) return 'Impresora Multifuncional';
  if (haystack.includes('impresora')) return 'Impresora';
  if (haystack.includes('escáner') || haystack.includes('escaner') || haystack.includes('scanner')) {
    return 'Escáner';
  }
  return undefined;
}

export function catalogRowToHoursDealProduct(
  row: CatalogRow,
  exchangeRate = getUsdToPenSaleRate(),
): HaitechShopProduct | null {
  const publicUsd = Number(row.prices?.public ?? 0);
  if (!Number.isFinite(publicUsd) || publicUsd < 0) return null;

  const pricePen = publicUsd > 0 ? usdToPenCharm(publicUsd, exchangeRate) : 0;
  const compareUsd = row.compare_at_price_usd;
  const comparePen =
    compareUsd != null && compareUsd > 0 ? usdToPenCharm(compareUsd, exchangeRate) : undefined;
  const hasDiscount = comparePen != null && comparePen > pricePen && pricePen > 0;
  const slug = String(row.slug ?? row.id ?? '').trim();
  const image = resolveProductImageUrl(row);
  const condition = inferShopCondition(row);
  const productTypeLabel = inferProductTypeLabel(row);

  const product: HaitechShopProduct = {
    id: row.id,
    name: row.name,
    brand: (row.brand ?? 'RICOH').toUpperCase(),
    stock: Math.max(0, Math.floor(Number(row.stock) || 0)),
    image: image || '/categories/multifuncionales.png',
    price: isPriceOnRequest(publicUsd) ? 0 : pricePen,
    isOffer: true,
    tabIds: ['ofertas'],
    href: productPath(slug || row.id),
  };

  if (row.code) product.code = String(row.code).trim();
  if (hasDiscount && comparePen != null) {
    product.compareAt = comparePen;
    product.discountLabel = `${Math.round((1 - pricePen / comparePen) * 100)}% DSCT`;
  }
  if (condition) product.condition = condition;
  if (productTypeLabel) product.productTypeLabel = productTypeLabel;

  return product;
}

function rankHoursDealRows(): CatalogRow[] {
  return getCatalogRows()
    .filter((row) => productHasOfferAttribute(row))
    .sort((left, right) => {
      const leftOrder = Number(left.sort_order ?? Number.MAX_SAFE_INTEGER);
      const rightOrder = Number(right.sort_order ?? Number.MAX_SAFE_INTEGER);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      const leftDiscount = (left.compare_at_price_usd ?? 0) > Number(left.prices?.public ?? 0);
      const rightDiscount = (right.compare_at_price_usd ?? 0) > Number(right.prices?.public ?? 0);
      if (leftDiscount !== rightDiscount) return leftDiscount ? -1 : 1;
      return (Number(right.stock) || 0) - (Number(left.stock) || 0);
    });
}

function isShowcasePageOffer(product: HaitechShopProduct): boolean {
  return product.isOffer === true || product.tabIds.includes('ofertas');
}

function withOfferAttribute(product: Product): Product {
  if (productHasOfferAttribute(product)) return product;
  return {
    ...product,
    attributes: [...(product.attributes ?? []), { id: 'oferta', name: 'Oferta', value: 'Sí' }],
  };
}

/**
 * Inventario con atributo Oferta + productos de la vitrina/home marcados en Ofertas.
 * Prioriza filas de catálogo; completa con stubs de vitrina (catálogo o sintético).
 */
export function listHoursDealOfferStoreProducts(limit = DEFAULT_LIMIT): Product[] {
  const byId = new Map<string, Product>();

  for (const row of rankHoursDealRows()) {
    byId.set(row.id, featuredToProduct(catalogRowToFeatured(row)));
    if (byId.size >= limit) return [...byId.values()];
  }

  for (const shop of listShowcaseEquipmentProducts()) {
    if (!isShowcasePageOffer(shop)) continue;

    const catalogRow = findShowcaseCatalogRow(shop);
    if (catalogRow) {
      if (byId.has(catalogRow.id)) continue;
      byId.set(
        catalogRow.id,
        withOfferAttribute(featuredToProduct(catalogRowToFeatured(catalogRow))),
      );
    } else {
      const synthetic = resolveShowcaseSyntheticProduct(shop.id);
      if (!synthetic || byId.has(synthetic.id)) continue;
      byId.set(synthetic.id, withOfferAttribute(synthetic));
    }

    if (byId.size >= limit) break;
  }

  return [...byId.values()];
}

/** Productos visibles del inventario marcados con el atributo Oferta (+ vitrina Ofertas). */
export function listHoursDealOfferProducts(limit = DEFAULT_LIMIT): HaitechShopProduct[] {
  const rate = getUsdToPenSaleRate();
  const products: HaitechShopProduct[] = [];
  const seen = new Set<string>();

  for (const row of rankHoursDealRows()) {
    const product = catalogRowToHoursDealProduct(row, rate);
    if (!product) continue;
    seen.add(product.id);
    products.push(product);
    if (products.length >= limit) return products;
  }

  for (const shop of listShowcaseEquipmentProducts()) {
    if (!isShowcasePageOffer(shop)) continue;
    const catalogRow = findShowcaseCatalogRow(shop);
    const id = catalogRow?.id ?? shop.id;
    if (seen.has(id)) continue;

    if (catalogRow) {
      const product = catalogRowToHoursDealProduct(catalogRow, rate);
      if (!product) continue;
      seen.add(product.id);
      products.push(product);
    } else {
      seen.add(shop.id);
      products.push({ ...shop, isOffer: true, tabIds: [...new Set([...shop.tabIds, 'ofertas' as const])] });
    }

    if (products.length >= limit) break;
  }

  return products;
}
