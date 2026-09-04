import { useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import {
  ensureFullPrices,
  PRICE_ROLE_LABELS,
  resolvePriceRole,
  resolveUserRoleDisplayPen,
  resolveUserRolePriceUsd,
  USER_ROLE_LABELS,
  type PriceRole,
  type UserRole,
} from '@/lib/roles';
import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { isEquipmentDisplayPriceCategory, roundPenToNearestNine } from '@/lib/pen-pricing';
import type { Product } from '@/types/product';

type CatalogPriceSource = {
  price: number;
  id?: string | undefined;
  code?: string | null | undefined;
  prices?: Product['prices'] | undefined;
  price_role?: Product['price_role'] | undefined;
  category?: string | null | undefined;
};

export interface CatalogRolePriceLine {
  role: UserRole;
  label: string;
  priceUsd: number;
  /** PEN exacto cuando el rol tiene precio fijo en soles (p. ej. corporativo 2). */
  pricePen?: number | undefined;
  priceRole: PriceRole;
}

export interface CatalogDisplayPrice {
  priceUsd: number;
  priceRole: PriceRole;
  previewAsRole: boolean;
  viewAsLabel: string | null;
  viewAsRolePrices: CatalogRolePriceLine[];
  showAdminPriceTooltip: boolean;
}

export function resolveCatalogDisplayPrice(
  product: CatalogPriceSource,
  options: {
    viewAsRoles: readonly UserRole[];
    effectiveRole: UserRole | 'public';
    isAdmin: boolean;
  },
): CatalogDisplayPrice {
  const previewAsRole = options.viewAsRoles.length > 0;
  const prices = ensureFullPrices(product.prices ?? { public: product.price });
  const isEquipment = isEquipmentDisplayPriceCategory(product.category);

  if (previewAsRole) {
    const saleRate = getUsdToPenSaleRate();
    const productKeys = [product.id, product.code];
    const viewAsRolePrices: CatalogRolePriceLine[] = options.viewAsRoles.map((userRole) => {
      const priceRole = userRole === 'corporativo2' ? 'public' : resolvePriceRole(userRole);
      const roleOptions = { isEquipment, saleRate, productKeys };
      const priceUsd = resolveUserRolePriceUsd(prices, userRole, roleOptions);
      const pricePen = resolveUserRoleDisplayPen(prices, userRole, {
        isEquipment,
        saleRate,
        productKeys,
        penFromUsd: (usd) =>
          isEquipment ? roundPenToNearestNine(usd * saleRate) : Math.round(usd * saleRate * 100) / 100,
      });
      return {
        role: userRole,
        label: USER_ROLE_LABELS[userRole],
        priceUsd,
        pricePen,
        priceRole,
      };
    });
    const primary = viewAsRolePrices[0]!;
    const viewAsLabel =
      viewAsRolePrices.length === 1
        ? primary.label
        : viewAsRolePrices.map((line) => line.label).join(' · ');

    return {
      priceUsd: primary.priceUsd,
      priceRole: primary.priceRole,
      previewAsRole: true,
      viewAsLabel,
      viewAsRolePrices,
      showAdminPriceTooltip: false,
    };
  }

  const priceRole = product.price_role ?? resolvePriceRole(options.effectiveRole);

  return {
    priceUsd: product.price,
    priceRole,
    previewAsRole: false,
    viewAsLabel: null,
    viewAsRolePrices: [],
    showAdminPriceTooltip: false,
  };
}

/**
 * Etiqueta de rol para «Copiar texto».
 * Rol público (o sin vista previa pública) → null (no se indica en el copy).
 */
export function resolveClipboardPriceRoleLabel(display: CatalogDisplayPrice): string | null {
  if (display.previewAsRole) {
    const primary = display.viewAsRolePrices[0];
    if (!primary || primary.role === 'public') return null;
    return primary.label;
  }
  if (display.priceRole === 'public') return null;
  return PRICE_ROLE_LABELS[display.priceRole];
}

/** Campos de precio/rol listos para el portapapeles. */
export function clipboardPriceFieldsFromDisplay(display: CatalogDisplayPrice): {
  priceUsd: number;
  priceRole: PriceRole;
  priceRoleLabel?: string;
} {
  const priceRoleLabel = resolveClipboardPriceRoleLabel(display);
  return {
    priceUsd: display.priceUsd,
    priceRole: display.priceRole,
    ...(priceRoleLabel != null ? { priceRoleLabel } : {}),
  };
}

/** Precio y metadatos de vista previa por rol para tarjetas de catálogo. */
export function useCatalogDisplayPrice(product: CatalogPriceSource): CatalogDisplayPrice {
  const { viewAsRoles, effectiveRole, isAdmin } = useAuth();

  return useMemo(
    () =>
      resolveCatalogDisplayPrice(product, {
        viewAsRoles,
        effectiveRole,
        isAdmin,
      }),
    [product.id, product.code, product.price, product.prices, product.price_role, product.category, viewAsRoles, effectiveRole, isAdmin],
  );
}
