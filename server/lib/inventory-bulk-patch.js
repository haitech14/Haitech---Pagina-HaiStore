import { randomUUID } from 'crypto';

import { normalizeAttributes } from './inventory-attributes.js';
import { migrateInventoryProduct } from './inventory-store.js';
import {
  getDefaultWarehouseId,
  normalizeProductStock,
  stockFromTotal,
} from './inventory-warehouses.js';
import { joinInventoryTagList, parseInventoryTagList } from './inventory-tags.js';
import { ensureFullPrices } from './roles.js';

function applyCategoryPatch(next, patch) {
  if (patch.categoryMode === 'add' && Array.isArray(patch.categories) && patch.categories.length > 0) {
    const merged = [...new Set([...parseInventoryTagList(next.category), ...patch.categories])];
    next.category = joinInventoryTagList(merged) || null;
    return;
  }

  if (
    patch.categoryMode === 'remove' &&
    Array.isArray(patch.categories) &&
    patch.categories.length > 0
  ) {
    const remove = new Set(patch.categories.map((c) => String(c).trim().toLowerCase()));
    const kept = parseInventoryTagList(next.category).filter(
      (c) => !remove.has(c.toLowerCase()),
    );
    next.category = joinInventoryTagList(kept) || null;
    return;
  }

  if (patch.categoryMode === 'set' && Array.isArray(patch.categories)) {
    next.category = joinInventoryTagList(patch.categories) || null;
    return;
  }

  if (typeof patch.category === 'string' && patch.category.trim()) {
    next.category = patch.category.trim();
  }
}

function applyNamePatch(next, patch) {
  const text = typeof patch.nameText === 'string' ? patch.nameText : '';
  if (!text && patch.nameMode !== 'replace') return;

  const current = String(next.name ?? '');

  switch (patch.nameMode) {
    case 'append':
      next.name = `${current}${text}`;
      break;
    case 'prepend':
      next.name = `${text}${current}`;
      break;
    case 'remove':
      next.name = current.split(text).join('').replace(/\s{2,}/g, ' ').trim();
      break;
    case 'replace':
      next.name = current.split(text).join(patch.nameReplaceWith ?? '').replace(/\s{2,}/g, ' ').trim();
      break;
    default:
      break;
  }
}

function applyAttributePatch(next, patch) {
  const current = normalizeAttributes(next.attributes);

  if (patch.attributeMode === 'add' && patch.attribute) {
    const name = String(patch.attribute.name ?? '').trim();
    const value = String(patch.attribute.value ?? '').trim();
    if (!name) return;

    const idx = current.findIndex((row) => row.name.toLowerCase() === name.toLowerCase());
    if (idx >= 0) {
      current[idx] = { ...current[idx], name, value };
    } else {
      current.push({ id: randomUUID(), name, value });
    }
    next.attributes = normalizeAttributes(current);
    return;
  }

  if (patch.attributeMode === 'remove') {
    const needle = String(patch.attributeName ?? patch.attribute?.name ?? '')
      .trim()
      .toLowerCase();
    if (!needle) return;
    next.attributes = normalizeAttributes(
      current.filter((row) => row.name.toLowerCase() !== needle),
    );
    return;
  }

  if (patch.attributeMode === 'set' && patch.attribute) {
    const name = String(patch.attribute.name ?? '').trim();
    const value = String(patch.attribute.value ?? '').trim();
    if (!name) return;
    next.attributes = normalizeAttributes([{ id: randomUUID(), name, value }]);
  }
}

export function applyBulkPatch(product, patch, warehouses) {
  const next = { ...product };

  applyCategoryPatch(next, patch);
  applyNamePatch(next, patch);
  applyAttributePatch(next, patch);

  if (patch.stockMode === 'set' && patch.stock !== undefined && patch.stock !== null) {
    const stockPatch = stockFromTotal(patch.stock, warehouses);
    next.stock = stockPatch.stock;
    next.stock_by_warehouse = stockPatch.stock_by_warehouse;
  } else if (patch.stockMode === 'add' && patch.stock !== undefined && patch.stock !== null) {
    const delta = Number(patch.stock) || 0;
    const defaultId = getDefaultWarehouseId(warehouses);
    const current = normalizeProductStock(
      next.stock_by_warehouse,
      next.stock,
      warehouses,
    );
    const stock_by_warehouse = current.stock_by_warehouse.map((row) =>
      row.warehouse_id === defaultId
        ? { ...row, quantity: Math.max(0, row.quantity + delta) }
        : row,
    );
    const stock = stock_by_warehouse.reduce((sum, row) => sum + row.quantity, 0);
    next.stock_by_warehouse = stock_by_warehouse;
    next.stock = stock;
  }

  if (patch.pricePercent !== undefined && patch.pricePercent !== null && patch.pricePercent !== '') {
    const factor = 1 + Number(patch.pricePercent) / 100;
    if (Number.isFinite(factor) && factor > 0) {
      const prices = { ...(next.prices ?? {}) };
      for (const key of Object.keys(prices)) {
        prices[key] = Math.round(Number(prices[key] ?? 0) * factor * 100) / 100;
      }
      next.prices = ensureFullPrices(prices);
    }
  }

  if (
    patch.purchasePricePercent !== undefined &&
    patch.purchasePricePercent !== null &&
    patch.purchasePricePercent !== ''
  ) {
    const factor = 1 + Number(patch.purchasePricePercent) / 100;
    if (Number.isFinite(factor) && factor > 0) {
      next.purchase_price_usd =
        Math.round(Number(next.purchase_price_usd ?? 0) * factor * 100) / 100;
    }
  }

  return migrateInventoryProduct(next, warehouses);
}
