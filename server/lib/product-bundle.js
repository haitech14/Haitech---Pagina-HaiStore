import { ensureFullPrices } from './roles.js';
import { getDefaultWarehouseId, normalizeProductStock, normalizeWarehouses } from './inventory-warehouses.js';

import {
  COMPATIBLE_TONER_BRAND_SUFFIX,
  COMPATIBLE_TONER_BRAND_SUFFIX_LEGACY,
} from '../../shared/compatible-toner.js';

export const TONER_PACK_QUANTITY = 4;
export const TONER_PACK_LABEL = 'Pack x04';
export const TONER_PACK_TYPE_VALUE = 'Pack x04';

const FOUR_COLOR_LABELS = ['Cyan', 'Magenta', 'Yellow', 'Negro'];
const BRAND_SUFFIX_END_PATTERN = new RegExp(
  `\\s+(?:${COMPATIBLE_TONER_BRAND_SUFFIX}|${COMPATIBLE_TONER_BRAND_SUFFIX_LEGACY})$`,
  'i',
);
const COLOR_SUFFIX_PATTERN = new RegExp(
  `\\s+(-\\s+)?(Cyan|Magenta|Yellow|Negro|Amarillo)\\s+(?:${COMPATIBLE_TONER_BRAND_SUFFIX}|${COMPATIBLE_TONER_BRAND_SUFFIX_LEGACY})$`,
  'i',
);

/**
 * @param {unknown} value
 * @returns {{ product_id: string; quantity: number }[]}
 */
export function normalizeBundleComponents(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const product_id = String(row.product_id ?? '').trim();
      const quantity = Math.max(1, Math.floor(Number(row.quantity) || 1));
      if (!product_id) return null;
      return { product_id, quantity };
    })
    .filter(Boolean);
}

/** @param {Record<string, unknown> | null | undefined} product */
export function isBundleProduct(product) {
  return normalizeBundleComponents(product?.bundle_components).length > 0;
}

/** @param {unknown} name */
export function stripTonerColorSuffix(name) {
  return String(name ?? '')
    .replace(COLOR_SUFFIX_PATTERN, '')
    .replace(/\s+-\s*$/, '')
    .trim();
}

/** @param {unknown} baseName */
export function buildTonerPackName(baseName) {
  const base = stripTonerColorSuffix(baseName).replace(BRAND_SUFFIX_END_PATTERN, '').trim();
  return `${base} ${TONER_PACK_LABEL}`.replace(/\s{2,}/g, ' ').trim();
}

/**
 * @param {Map<string, Record<string, unknown>>} productsById
 * @param {{ product_id: string; quantity: number }} component
 */
function componentAvailableUnits(productsById, component) {
  const product = productsById.get(component.product_id);
  if (!product) return 0;
  const stock = Math.max(0, Math.floor(Number(product.stock) || 0));
  return Math.floor(stock / Math.max(1, component.quantity));
}

/**
 * @param {Record<string, unknown>} product
 * @param {Map<string, Record<string, unknown>>} productsById
 */
export function resolveBundleStock(product, productsById) {
  const components = normalizeBundleComponents(product.bundle_components);
  if (components.length === 0) {
    return Math.max(0, Math.floor(Number(product.stock) || 0));
  }
  return Math.min(...components.map((component) => componentAvailableUnits(productsById, component)));
}

/**
 * @param {{ product_id: string; quantity: number }[]} components
 * @param {Map<string, Record<string, unknown>>} productsById
 */
export function sumBundlePrices(components, productsById) {
  /** @type {Record<string, number>} */
  const totals = { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 };

  for (const component of components) {
    const product = productsById.get(component.product_id);
    if (!product) continue;
    const prices = ensureFullPrices(product.prices ?? { public: product.price ?? 0 });
    const qty = Math.max(1, component.quantity);
    for (const role of Object.keys(totals)) {
      totals[role] += (Number(prices[role]) || 0) * qty;
    }
  }

  for (const role of Object.keys(totals)) {
    totals[role] = Math.round(totals[role] * 100) / 100;
  }

  return ensureFullPrices(totals);
}

/**
 * @param {{ product_id: string; quantity: number }[]} components
 * @param {Map<string, Record<string, unknown>>} productsById
 * @param {ReturnType<typeof normalizeWarehouses>} warehouses
 */
export function resolveBundleStockByWarehouse(components, productsById, warehouses) {
  const list = normalizeWarehouses(warehouses);

  return list.map((warehouse) => {
    const quantity = Math.min(
      ...components.map((component) => {
        const product = productsById.get(component.product_id);
        if (!product) return 0;
        const normalized = normalizeProductStock(
          product.stock_by_warehouse,
          product.stock,
          list,
        );
        const row = normalized.stock_by_warehouse.find(
          (entry) => entry.warehouse_id === warehouse.id,
        );
        const available = Math.max(0, Math.floor(Number(row?.quantity) || 0));
        return Math.floor(available / Math.max(1, component.quantity));
      }),
    );

    return {
      warehouse_id: warehouse.id,
      quantity: Number.isFinite(quantity) ? Math.max(0, quantity) : 0,
    };
  });
}

/**
 * @param {Record<string, unknown>} product
 * @param {Map<string, Record<string, unknown>>} productsById
 * @param {ReturnType<typeof normalizeWarehouses>} warehouses
 */
export function syncBundleProductFromComponents(product, productsById, warehouses) {
  const components = normalizeBundleComponents(product.bundle_components);
  if (components.length === 0) return product;

  const prices = sumBundlePrices(components, productsById);
  const purchase_price_usd = Math.round(
    components.reduce((sum, component) => {
      const row = productsById.get(component.product_id);
      const unit = Math.max(0, Number(row?.purchase_price_usd) || 0);
      return sum + unit * Math.max(1, component.quantity);
    }, 0) * 100,
  ) / 100;
  const stock_by_warehouse = resolveBundleStockByWarehouse(components, productsById, warehouses);
  const stock = stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0);

  return {
    ...product,
    prices,
    purchase_price_usd,
    stock,
    stock_by_warehouse,
  };
}

/**
 * @param {Record<string, unknown>[]} products
 * @param {ReturnType<typeof normalizeWarehouses>} warehouses
 */
export function syncInventoryBundleProducts(products, warehouses) {
  const byId = new Map(products.map((product) => [String(product.id), product]));
  let changed = false;

  const synced = products.map((product) => {
    if (!isBundleProduct(product)) return product;
    const next = syncBundleProductFromComponents(product, byId, warehouses);
    if (
      JSON.stringify({
        prices: product.prices,
        purchase_price_usd: product.purchase_price_usd,
        stock: product.stock,
        stock_by_warehouse: product.stock_by_warehouse,
      }) !==
      JSON.stringify({
        prices: next.prices,
        purchase_price_usd: next.purchase_price_usd,
        stock: next.stock,
        stock_by_warehouse: next.stock_by_warehouse,
      })
    ) {
      changed = true;
    }
    byId.set(String(next.id), next);
    return next;
  });

  return { products: synced, changed };
}

/**
 * @param {{ productId?: string | null; quantity?: number }[]} lineItems
 * @param {Map<string, Record<string, unknown>>} productsById
 * @returns {Map<string, number>}
 */
export function expandSaleLinesForStock(lineItems, productsById) {
  /** @type {Map<string, number>} */
  const totals = new Map();

  for (const line of lineItems) {
    const productId = String(line.productId ?? '').trim();
    const lineQty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    if (!productId) continue;

    const product = productsById.get(productId);
    if (product && isBundleProduct(product)) {
      for (const component of normalizeBundleComponents(product.bundle_components)) {
        const qty = lineQty * Math.max(1, component.quantity);
        totals.set(component.product_id, (totals.get(component.product_id) ?? 0) + qty);
      }
      continue;
    }

    totals.set(productId, (totals.get(productId) ?? 0) + lineQty);
  }

  return totals;
}

/**
 * @param {Record<string, unknown>} product
 * @param {number} quantity
 * @param {ReturnType<typeof normalizeWarehouses>} warehouses
 */
export function deductProductStock(product, quantity, warehouses) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  if (qty === 0) return product;

  const list = normalizeWarehouses(warehouses);
  const defaultId = getDefaultWarehouseId(list);
  const current = normalizeProductStock(product.stock_by_warehouse, product.stock, list);
  let remaining = qty;

  const stock_by_warehouse = current.stock_by_warehouse.map((row) => {
    if (remaining <= 0) return row;
    const deduct = Math.min(row.quantity, remaining);
    remaining -= deduct;
    return { ...row, quantity: Math.max(0, row.quantity - deduct) };
  });

  if (remaining > 0) {
    const defaultIndex = stock_by_warehouse.findIndex((row) => row.warehouse_id === defaultId);
    if (defaultIndex >= 0) {
      stock_by_warehouse[defaultIndex] = {
        ...stock_by_warehouse[defaultIndex],
        quantity: Math.max(0, stock_by_warehouse[defaultIndex].quantity - remaining),
      };
    }
  }

  const stock = stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0);
  return { ...product, stock_by_warehouse, stock };
}

/**
 * @param {Record<string, unknown>[]} products
 */
export function groupFourColorTonerProducts(products) {
  /** @type {Map<string, Map<string, Record<string, unknown>>>} */
  const groups = new Map();

  for (const product of products) {
    if (isBundleProduct(product)) continue;
    const color = (product.attributes ?? []).find((row) => row?.name === 'Color')?.value;
    if (!color || !FOUR_COLOR_LABELS.includes(String(color))) continue;

    const base = stripTonerColorSuffix(product.name);
    if (!groups.has(base)) groups.set(base, new Map());
    groups.get(base).set(String(color).toLowerCase(), product);
  }

  /** @type {Array<{ baseName: string; components: { product_id: string; quantity: number }[]; componentProducts: Record<string, unknown>[] }>} */
  const packs = [];

  for (const [baseName, colors] of groups) {
    const required = ['cyan', 'magenta', 'yellow', 'negro'];
    if (!required.every((key) => colors.has(key))) continue;

    const componentProducts = required.map((key) => colors.get(key));
    packs.push({
      baseName,
      components: componentProducts.map((row) => ({
        product_id: String(row.id),
        quantity: 1,
      })),
      componentProducts,
    });
  }

  return packs;
}

/**
 * @param {string} code
 */
export function tonerPackIdFromCode(code) {
  const slug = String(code)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `toner-pack-${slug || 'sin-codigo'}`;
}

/**
 * @param {{
 *   baseName: string;
 *   components: { product_id: string; quantity: number }[];
 *   componentProducts: Record<string, unknown>[];
 *   category?: string | null;
 *   existing?: Record<string, unknown> | null;
 * }} input
 */
export function buildFourColorTonerPackProduct(input) {
  const { baseName, components, componentProducts, category, existing } = input;
  const firstCode = String(componentProducts[0]?.code ?? '').trim();
  const codeBase = firstCode.replace(/-(CYAN|MAGENTA|YELLOW|NEGRO)$/i, '');
  const code = `${codeBase || 'PACK'}-PACK04`.slice(0, 64);
  const id = existing?.id ? String(existing.id) : tonerPackIdFromCode(code);
  const name = buildTonerPackName(baseName);
  const modelLabel = stripTonerColorSuffix(baseName)
    .replace(/^Toner Cartucho Compatible RICOH\s+/i, '')
    .replace(BRAND_SUFFIX_END_PATTERN, '')
    .trim();

  return {
    id,
    code,
    name,
    description: name,
    brand: componentProducts[0]?.brand ?? null,
    category: category ?? componentProducts[0]?.category ?? null,
    currency: 'USD',
    image_url: null,
    gallery: [],
    bundle_components: components,
    attributes: [
      { name: 'Tipo', value: TONER_PACK_TYPE_VALUE },
      ...(modelLabel ? [{ name: 'Modelo de equipo', value: modelLabel }] : []),
      { name: 'Contenido', value: 'Cyan + Magenta + Yellow + Negro' },
    ],
    suppliers: [],
    attachments: [],
    purchase_price_usd: 0,
    prices: ensureFullPrices({ public: 0 }),
    stock: 0,
    stock_by_warehouse: [],
    sort_order: Number(existing?.sort_order ?? componentProducts[0]?.sort_order ?? 0),
    created_at: existing?.created_at ?? new Date().toISOString(),
  };
}
