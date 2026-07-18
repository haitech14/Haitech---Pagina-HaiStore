import {
  parseBulkDiscountRange,
  tierQualifiesForQuantity,
} from './bulk-discount-range.js';
import { ensureFullPrices } from '../server/lib/roles.js';

const PRICE_ROLES = ['public', 'tecnico', 'mayorista', 'distribuidor'];

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* HTTP por IP / contexto no seguro */
    }
  }
  return `vol-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function tierMinQuantity(range) {
  const bounds = parseBulkDiscountRange(range);
  return bounds?.min ?? Number.POSITIVE_INFINITY;
}

export function normalizeVolumeRolePriceTier(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const range = String(raw.range ?? '').trim();
  if (!range || !parseBulkDiscountRange(range)) return null;

  const prices = ensureFullPrices(raw.prices ?? {});
  const hasPrice = PRICE_ROLES.some((role) => Number(prices[role]) > 0);
  if (!hasPrice) return null;

  const id =
    typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : randomId();

  return { id, range, prices };
}

export function normalizeVolumeRolePrices(input) {
  if (!Array.isArray(input)) return [];

  return input
    .map((tier) => normalizeVolumeRolePriceTier(tier))
    .filter(Boolean)
    .sort((a, b) => tierMinQuantity(a.range) - tierMinQuantity(b.range));
}

export function resolveVolumeRoleTierForQuantity(quantity, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0 || quantity < 1) return null;

  let best = null;
  let bestMin = -1;

  for (const tier of tiers) {
    if (!tierQualifiesForQuantity(quantity, tier.range)) continue;
    const min = tierMinQuantity(tier.range);
    if (min >= bestMin) {
      best = tier;
      bestMin = min;
    }
  }

  return best;
}

export function resolveVolumeRoleUnitUsd(quantity, role, basePrices, tiers) {
  const safeRole = PRICE_ROLES.includes(role) ? role : 'public';
  const base = ensureFullPrices(basePrices ?? {});
  const tier = resolveVolumeRoleTierForQuantity(quantity, tiers);
  if (!tier) return base[safeRole] ?? base.public ?? 0;

  const tierPrice = Number(tier.prices?.[safeRole]) || 0;
  if (tierPrice > 0) return tierPrice;

  return base[safeRole] ?? base.public ?? 0;
}

export function resolveVolumeRolePricing(quantity, role, basePrices, tiers) {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const base = ensureFullPrices(basePrices ?? {});
  const safeRole = PRICE_ROLES.includes(role) ? role : 'public';
  const baseUnitUsd = base[safeRole] ?? base.public ?? 0;
  const unitUsd = resolveVolumeRoleUnitUsd(safeQuantity, safeRole, base, tiers);
  const totalUsd = Math.round(unitUsd * safeQuantity * 100) / 100;
  const baseTotalUsd = Math.round(baseUnitUsd * safeQuantity * 100) / 100;

  return {
    tier: resolveVolumeRoleTierForQuantity(safeQuantity, tiers),
    unitUsd,
    totalUsd,
    baseTotalUsd,
    savingsUsd: Math.max(0, Math.round((baseTotalUsd - totalUsd) * 100) / 100),
  };
}

export function createEmptyVolumeRolePriceTier() {
  return {
    id: randomId(),
    range: '',
    prices: ensureFullPrices({}),
  };
}
