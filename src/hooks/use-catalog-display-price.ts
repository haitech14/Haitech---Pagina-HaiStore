import { useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import {
  ensureFullPrices,
  PRICE_ROLE_LABELS,
  resolvePriceRole,
  USER_ROLE_LABELS,
  type PriceRole,
  type UserRole,
} from '@/lib/roles';
import type { Product } from '@/types/product';

type CatalogPriceSource = Pick<Product, 'price' | 'prices' | 'price_role'>;

export interface CatalogRolePriceLine {
  role: UserRole;
  label: string;
  priceUsd: number;
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

  if (previewAsRole) {
    const viewAsRolePrices: CatalogRolePriceLine[] = options.viewAsRoles.map((userRole) => {
      const priceRole = resolvePriceRole(userRole);
      return {
        role: userRole,
        label: USER_ROLE_LABELS[userRole],
        priceUsd: prices[priceRole] ?? product.price,
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
    showAdminPriceTooltip: options.isAdmin,
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
    [product.price, product.prices, product.price_role, viewAsRoles, effectiveRole, isAdmin],
  );
}
