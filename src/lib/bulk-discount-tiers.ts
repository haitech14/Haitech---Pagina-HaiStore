import type { BulkDiscountTier } from '@/types/product-detail';

export const DEFAULT_BULK_DISCOUNT_TIERS: BulkDiscountTier[] = [
  { range: '2', discount: '5% dscto.', discountPercent: 5 },
  { range: '3', discount: '10% dscto.', discountPercent: 10 },
  { range: '5', discount: '15% dscto.', discountPercent: 15 },
  { range: '10+', discount: '20% dscto.', discountPercent: 20 },
];

/** Tope de descuento por volumen en equipos (impresoras / multifuncionales). */
export const EQUIPMENT_BULK_DISCOUNT_MAX_PERCENT = 5;

/** Tramos graduales de equipos: 2% → 3% → 5%. */
export const EQUIPMENT_BULK_DISCOUNT_TIERS: BulkDiscountTier[] = [
  { range: '2', discount: '2% dscto.', discountPercent: 2 },
  { range: '3', discount: '3% dscto.', discountPercent: 3 },
  {
    range: '5',
    discount: `${EQUIPMENT_BULK_DISCOUNT_MAX_PERCENT}% dscto.`,
    discountPercent: EQUIPMENT_BULK_DISCOUNT_MAX_PERCENT,
  },
];

export function resolveCatalogBulkDiscountTiers(
  isEquipment: boolean,
  companyTiers?: BulkDiscountTier[] | null,
): BulkDiscountTier[] {
  if (isEquipment) return EQUIPMENT_BULK_DISCOUNT_TIERS;
  return companyTiers && companyTiers.length > 0 ? companyTiers : DEFAULT_BULK_DISCOUNT_TIERS;
}

/** Copy de ahorro por unidad, p. ej. `$30 menos en cada uno`. */
export function formatUsdLessPerUnit(savingsUsd: number): string {
  const safe = Math.max(0, savingsUsd);
  const rounded = Math.round(safe);
  if (rounded >= 1) {
    return `$${rounded.toLocaleString('en-US')} menos en cada uno`;
  }
  const cents = Math.round(safe * 100) / 100;
  if (cents <= 0) return '$0 menos en cada uno';
  return `$${cents.toFixed(2)} menos en cada uno`;
}

const LEGACY_BULK_DISCOUNT_RANGES = new Set(['1-4', '5-9', '10-14', '15-20']);

export function formatBulkDiscountLabel(discountPercent: number): string {
  const percent = Math.round(discountPercent);
  return `${percent}% dscto.`;
}

export function normalizeBulkDiscountTier(
  input: Partial<BulkDiscountTier> | null | undefined,
): BulkDiscountTier | null {
  if (!input) return null;

  const range = String(input.range ?? '').trim();
  const discountPercent = Math.min(100, Math.max(0, Number(input.discountPercent) || 0));

  if (!range || discountPercent <= 0) return null;

  return {
    range,
    discountPercent,
    discount: formatBulkDiscountLabel(discountPercent),
  };
}

function isLegacyBulkDiscountConfig(tiers: BulkDiscountTier[]): boolean {
  if (tiers.length !== LEGACY_BULK_DISCOUNT_RANGES.size) return false;
  return tiers.every((tier) => LEGACY_BULK_DISCOUNT_RANGES.has(tier.range.trim()));
}

export function normalizeBulkDiscountTiers(input: unknown): BulkDiscountTier[] {
  if (!Array.isArray(input) || input.length === 0) {
    return DEFAULT_BULK_DISCOUNT_TIERS;
  }

  const tiers = input
    .map((item) => normalizeBulkDiscountTier(item as Partial<BulkDiscountTier>))
    .filter((tier): tier is BulkDiscountTier => tier !== null);

  if (tiers.length === 0) return DEFAULT_BULK_DISCOUNT_TIERS;
  if (isLegacyBulkDiscountConfig(tiers)) return DEFAULT_BULK_DISCOUNT_TIERS;

  return tiers;
}

export function tierUnitUsd(basePriceUsd: number, discountPercent: number): number {
  return Math.round(basePriceUsd * (1 - discountPercent / 100) * 100) / 100;
}

/** Descuento máximo permitido al público sin bajar del precio técnico. */
export function resolveMaxPublicBulkDiscountPercent(
  publicPriceUsd: number,
  tecnicoPriceUsd: number,
): number {
  if (publicPriceUsd <= 0 || tecnicoPriceUsd <= 0) return 100;
  if (tecnicoPriceUsd >= publicPriceUsd) return 0;
  return Math.round((1 - tecnicoPriceUsd / publicPriceUsd) * 10000) / 100;
}

export function capBulkDiscountPercent(
  discountPercent: number,
  publicPriceUsd: number,
  floorPriceUsd: number,
): number {
  if (floorPriceUsd <= 0) return discountPercent;
  const maxDiscount = resolveMaxPublicBulkDiscountPercent(publicPriceUsd, floorPriceUsd);
  return Math.min(discountPercent, maxDiscount);
}

export function resolveBulkTierUnitUsd(
  publicPriceUsd: number,
  discountPercent: number,
  floorPriceUsd = 0,
): number {
  const effectivePercent = capBulkDiscountPercent(discountPercent, publicPriceUsd, floorPriceUsd);
  const discounted = tierUnitUsd(publicPriceUsd, effectivePercent);
  if (floorPriceUsd <= 0) return discounted;
  return Math.max(floorPriceUsd, discounted);
}

export interface EffectiveBulkDiscountTier {
  discountPercent: number;
  discount: string;
  unitUsd: number;
  cappedByTecnico: boolean;
}

export function resolveEffectiveBulkDiscountTier(
  tier: BulkDiscountTier,
  publicPriceUsd: number,
  floorPriceUsd = 0,
): EffectiveBulkDiscountTier {
  const effectivePercent = capBulkDiscountPercent(tier.discountPercent, publicPriceUsd, floorPriceUsd);
  const unitUsd = resolveBulkTierUnitUsd(publicPriceUsd, tier.discountPercent, floorPriceUsd);
  return {
    discountPercent: effectivePercent,
    discount: formatBulkDiscountLabel(effectivePercent),
    unitUsd,
    cappedByTecnico: effectivePercent + 0.001 < tier.discountPercent,
  };
}

function isLegacyRangeFormat(range: string): boolean {
  return /^\d+\s*-\s*\d+$/i.test(range.trim().replace(/^compra\s+/i, ''));
}

export function parseBulkDiscountRange(range: string): { min: number; max: number } | null {
  const normalized = range.trim().replace(/^compra\s+/i, '');
  const plusMatch = normalized.match(/^(\d+)\+$/i);
  if (plusMatch) {
    return { min: Number(plusMatch[1]), max: Number.POSITIVE_INFINITY };
  }

  const rangeMatch = normalized.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  const singleMatch = normalized.match(/^(\d+)$/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    return { min: value, max: value };
  }

  return null;
}

function tierQualifiesForQuantity(quantity: number, range: string): boolean {
  const bounds = parseBulkDiscountRange(range);
  if (!bounds) return false;

  if (isLegacyRangeFormat(range)) {
    return quantity >= bounds.min && quantity <= bounds.max;
  }

  return quantity >= bounds.min;
}

export function resolveBulkDiscountTierForQuantity(
  quantity: number,
  tiers: BulkDiscountTier[],
): BulkDiscountTier | null {
  if (quantity < 1 || tiers.length === 0) return null;

  let bestMatch: BulkDiscountTier | null = null;

  for (const tier of tiers) {
    if (!tierQualifiesForQuantity(quantity, tier.range)) continue;

    if (!bestMatch || tier.discountPercent > bestMatch.discountPercent) {
      bestMatch = tier;
    }
  }

  return bestMatch;
}

export interface BulkDiscountPricing {
  tier: BulkDiscountTier | null;
  unitUsd: number;
  totalUsd: number;
  baseTotalUsd: number;
  savingsUsd: number;
  effectiveDiscountPercent: number;
}

export interface BulkDiscountPricingOptions {
  /** Precio técnico (piso): el descuento público no puede dejar la unidad por debajo. */
  floorPriceUsd?: number;
}

export function resolveBulkDiscountPricing(
  quantity: number,
  basePriceUsd: number,
  tiers: BulkDiscountTier[],
  options: BulkDiscountPricingOptions = {},
): BulkDiscountPricing {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  const floorPriceUsd = options.floorPriceUsd ?? 0;
  const tier = resolveBulkDiscountTierForQuantity(safeQuantity, tiers);
  const effectiveDiscountPercent = tier
    ? capBulkDiscountPercent(tier.discountPercent, basePriceUsd, floorPriceUsd)
    : 0;
  const unitUsd = tier
    ? resolveBulkTierUnitUsd(basePriceUsd, tier.discountPercent, floorPriceUsd)
    : basePriceUsd;
  const totalUsd = Math.round(unitUsd * safeQuantity * 100) / 100;
  const baseTotalUsd = Math.round(basePriceUsd * safeQuantity * 100) / 100;
  const savingsUsd = Math.max(0, Math.round((baseTotalUsd - totalUsd) * 100) / 100);

  return {
    tier,
    unitUsd,
    totalUsd,
    baseTotalUsd,
    savingsUsd,
    effectiveDiscountPercent,
  };
}

export interface BulkDiscountSavingsHint {
  targetQuantity: number;
  savingsUsd: number;
  isActive: boolean;
}

export function resolveBulkDiscountSavingsHint(
  quantity: number,
  basePriceUsd: number,
  tiers: BulkDiscountTier[],
  options: BulkDiscountPricingOptions = {},
): BulkDiscountSavingsHint | null {
  if (tiers.length === 0) return null;

  const pricing = resolveBulkDiscountPricing(quantity, basePriceUsd, tiers, options);
  if (pricing.savingsUsd > 0.001) {
    return {
      targetQuantity: Math.max(1, Math.floor(quantity)),
      savingsUsd: pricing.savingsUsd,
      isActive: true,
    };
  }

  const nextTier = tiers
    .map((tier) => ({ tier, bounds: parseBulkDiscountRange(tier.range) }))
    .filter(
      (entry): entry is { tier: BulkDiscountTier; bounds: { min: number; max: number } } =>
        entry.bounds != null && quantity < entry.bounds.min,
    )
    .sort((a, b) => a.bounds.min - b.bounds.min)[0];

  if (!nextTier) return null;

  const futurePricing = resolveBulkDiscountPricing(
    nextTier.bounds.min,
    basePriceUsd,
    tiers,
    options,
  );
  if (futurePricing.savingsUsd <= 0.001) return null;

  return {
    targetQuantity: nextTier.bounds.min,
    savingsUsd: futurePricing.savingsUsd,
    isActive: false,
  };
}
