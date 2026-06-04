import type { ReactNode } from 'react';

import { InventoryDualPrice } from '@/components/admin/inventory/inventory-dual-price';
import { DualPrice } from '@/components/product-showcase-card';
import { useAdminProductRolePrices } from '@/hooks/use-admin-inventory-price-map';
import { useAdminInventory } from '@/hooks/use-products';
import { useAuth } from '@/context/auth-context';
import {
  PRICE_ROLE_LABELS,
  PRICE_ROLES_EDIT_ORDER,
  type PriceRole,
} from '@/lib/roles';
import { cn } from '@/lib/utils';

interface AdminRolePricesTooltipProps {
  productId: string;
  /** Precio visible en vitrina (rol del visitante). */
  displayUsd: number;
  className?: string;
  children?: ReactNode;
}

export function AdminRolePricesTooltip({
  productId,
  displayUsd,
  className,
  children,
}: AdminRolePricesTooltipProps) {
  const { isAdmin } = useAuth();
  const { isLoading, isFetching } = useAdminInventory();
  const rolePrices = useAdminProductRolePrices(productId);
  const pricesLoading = isLoading || isFetching;

  if (!isAdmin) {
    return children ?? <DualPrice usd={displayUsd} {...(className ? { className } : {})} />;
  }

  return (
    <span
      className={cn(
        'group/role-prices relative z-20 inline-block pointer-events-auto',
        className,
      )}
    >
      <span
        tabIndex={0}
        className="cursor-help rounded-sm outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-red-600"
        aria-describedby={`role-prices-${productId}`}
      >
        {children ?? (
          <DualPrice
            usd={displayUsd}
            className="border-b border-dotted border-neutral-400/80 pb-px"
          />
        )}
      </span>

      <span
        id={`role-prices-${productId}`}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-max min-w-[11rem] max-w-[min(100vw-2rem,16rem)]',
          'rounded-lg border border-neutral-200 bg-white px-3 py-2.5 shadow-lg',
          'opacity-0 transition-opacity duration-150',
          'group-hover/role-prices:opacity-100 group-focus-within/role-prices:opacity-100',
        )}
      >
        <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-500">
          Precios por rol
        </p>
        {rolePrices ? (
          <ul className="space-y-2">
            {PRICE_ROLES_EDIT_ORDER.map((role: PriceRole) => (
              <li key={role} className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-neutral-700">
                  {PRICE_ROLE_LABELS[role]}
                </span>
                <InventoryDualPrice usd={rolePrices[role]} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-neutral-600">
            {pricesLoading
              ? 'Cargando listas de precio…'
              : 'No hay precios por rol para este producto.'}
          </p>
        )}
      </span>
    </span>
  );
}
