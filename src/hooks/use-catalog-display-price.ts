import { useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import { ensureFullPrices, resolvePriceRole, USER_ROLE_LABELS, type PriceRole, type UserRole } from '@/lib/roles';
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
