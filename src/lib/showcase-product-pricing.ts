import { resolveShowcaseEquipmentTecnicoUsd } from '@/data/haitech-home-equipment-showcase';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import type { CatalogRolePriceLine } from '@/hooks/use-catalog-display-price';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import {
  ensureFullPrices,
  resolvePriceRole,
  resolveUserRoleDisplayPen,
  resolveUserRolePriceUsd,
  USER_ROLE_LABELS,
  type PriceRole,
  type ProductRolePrices,
  type UserRole,
} from '@/lib/roles';
import { roundEquipmentDisplayUsd, roundPenToNearestNine } from '@/lib/pen-pricing';
import { findShowcaseCatalogRow } from '@/lib/showcase-product-href';
import { penToUsd } from '@/lib/utils';

export function resolveShowcaseProductPricesUsd(
  product: HaitechShopProduct,
  options: {
    saleRate?: number | undefined;
    isConsumable: boolean;
  },
): ProductRolePrices {
  const rate = options.saleRate ?? DEFAULT_USD_TO_PEN;
  const catalogRow = findShowcaseCatalogRow(product);

  if (catalogRow?.prices) {
    return ensureFullPrices(catalogRow.prices);
  }

  const publicUsdRaw = penToUsd(product.price, rate);
  const publicUsd = options.isConsumable
    ? publicUsdRaw
    : roundEquipmentDisplayUsd(publicUsdRaw);
  const tecnicoUsd = resolveShowcaseEquipmentTecnicoUsd(product);

  return ensureFullPrices({
    public: publicUsd,
    ...(tecnicoUsd != null && tecnicoUsd > 0 ? { tecnico: tecnicoUsd } : {}),
  });
}

export function showcaseUsdToPen(
  usd: number,
  options: { saleRate?: number | undefined; isConsumable: boolean },
): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  const rate = options.saleRate ?? DEFAULT_USD_TO_PEN;
  if (options.isConsumable) {
    return Math.round(usd * rate * 100) / 100;
  }
  return roundPenToNearestNine(usd * rate);
}

export function showcaseDisplayUsd(
  usd: number,
  options: { isConsumable: boolean },
): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return options.isConsumable ? usd : roundEquipmentDisplayUsd(usd);
}

export function resolveShowcaseRolePriceLines(
  product: HaitechShopProduct,
  viewAsRoles: readonly UserRole[],
  options: {
    saleRate?: number | undefined;
    isConsumable: boolean;
  },
): CatalogRolePriceLine[] {
  const pricesUsd = resolveShowcaseProductPricesUsd(product, options);
  const productKeys = [product.id, product.code];
  const pricingContext = {
    isEquipment: !options.isConsumable,
    saleRate: options.saleRate,
    productKeys,
  };

  return viewAsRoles.map((userRole) => {
    const priceRole = userRole === 'corporativo2' ? 'public' : resolvePriceRole(userRole);
    const rawUsd = resolveUserRolePriceUsd(pricesUsd, userRole, pricingContext);
    const priceUsd = options.isConsumable ? rawUsd : showcaseDisplayUsd(rawUsd, options);
    const pricePen = resolveUserRoleDisplayPen(pricesUsd, userRole, {
      ...pricingContext,
      penFromUsd: (usd) => showcaseUsdToPen(usd, options),
    });
    return {
      role: userRole,
      label: USER_ROLE_LABELS[userRole],
      priceUsd,
      pricePen,
      priceRole,
    };
  });
}

export function resolveShowcaseActivePriceRole(
  viewAsRoles: readonly UserRole[],
  effectiveRole: UserRole | 'public',
): PriceRole {
  if (viewAsRoles.length === 1) {
    return resolvePriceRole(effectiveRole);
  }
  return 'public';
}
