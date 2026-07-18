import type { ReactNode } from 'react';

import { InventoryDualPrice } from '@/components/admin/inventory/inventory-dual-price';
import { DualPrice } from '@/components/product/product-dual-price';
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
  const { isAdmin, viewAsRoles } = useAuth();
  const { isLoading, isFetching } = useAdminInventory();
  const rolePrices = useAdminProductRolePrices(productId);
  const pricesLoading = isLoading || isFetching;

  if (!isAdmin || viewAsRoles.length > 0) {
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
          'pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 w-max min-w-[9rem] max-w-[min(100vw-2rem,13rem)]',
          'rounded-md border border-neutral-200 bg-white px-2 py-1.5 shadow-md',
          'opacity-0 transition-opacity duration-150',
          'group-hover/role-prices:opacity-100 group-focus-within/role-prices:opacity-100',
        )}
      >
        <div className="mb-1 text-[0.55rem] font-semibold uppercase tracking-wide text-neutral-500">
          Precios por rol
        </div>
        {rolePrices ? (
          <ul className="space-y-1">
            {PRICE_ROLES_EDIT_ORDER.map((role: PriceRole) => (
              <li key={role} className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] font-medium leading-none text-neutral-700">
                  {PRICE_ROLE_LABELS[role]}
                </span>
                <InventoryDualPrice usd={rolePrices[role]} compact />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[0.65rem] leading-snug text-neutral-600">
            {pricesLoading
              ? 'Cargando listas de precio…'
              : 'No hay precios por rol para este producto.'}
          </div>
        )}
      </span>
    </span>
  );
}
