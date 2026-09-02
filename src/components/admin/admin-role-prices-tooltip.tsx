import type { ReactNode } from 'react';

import { DualPrice } from '@/components/product/product-dual-price';

interface AdminRolePricesTooltipProps {
  productId: string;
  /** Precio visible en vitrina (rol del visitante). */
  displayUsd: number;
  className?: string;
  children?: ReactNode;
}

/** En vitrina el admin ve solo el precio corporativo activo (sin desglose por rol). */
export function AdminRolePricesTooltip({
  productId: _productId,
  displayUsd,
  className,
  children,
}: AdminRolePricesTooltipProps) {
  void _productId;
  return children ?? <DualPrice usd={displayUsd} {...(className ? { className } : {})} />;
}
