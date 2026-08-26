import { useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/hooks/use-products';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import { getCatalogRows } from '@/lib/catalog-featured';
import {
  resolveEquipmentTonerPriceLines,
  type EquipmentTonerPriceLine,
} from '@/lib/product-card-toner-prices';
import { toPublicProduct } from '@/lib/pricing';
import { resolvePriceRole } from '@/lib/roles';
import { cn, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductTonerPricesHoverProps {
  product: Product;
  children: ReactNode;
  className?: string;
}

function TonerPricesPanel({ lines }: { lines: EquipmentTonerPriceLine[] }) {
  const originals = lines.filter((line) => line.supplyType === 'original');
  const shown = originals.length > 0 ? originals : lines;
  const heading = originals.length > 0 ? 'Tóner original' : 'Tóner';

  return (
    <div
      role="status"
      className="rounded-lg border border-[#e6e8ee] bg-white/95 px-2.5 py-2 text-left shadow-md backdrop-blur-sm"
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-[#8a93a3]">
        {heading}
      </p>
      <ul className="mt-1 space-y-0.5">
        {shown.map((line) => (
          <li key={line.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="min-w-0 max-w-[8.5rem] truncate text-[#111111]">{line.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-[#111111]">
              {formatUsd(line.priceUsd)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Al pasar el cursor sobre la zona de imagen de un equipo, muestra precios de tóner.
 * No intercepta clics (`pointer-events-none` en el panel).
 */
export function ProductTonerPricesHover({
  product,
  children,
  className,
}: ProductTonerPricesHoverProps) {
  const { effectiveRole, role } = useAuth();
  const canShow = isPrinterEquipment(product);
  const [hovering, setHovering] = useState(false);
  const { data: queryCatalog } = useProducts({ enabled: canShow && hovering });

  const lines = useMemo(() => {
    if (!canShow || !hovering) return [];
    const priceRole = resolvePriceRole(String(effectiveRole));
    let catalog: Product[] = queryCatalog ?? [];
    if (catalog.length === 0) {
      const rows = getCatalogRows();
      if (rows.length > 0) {
        catalog = rows.map((row) => toPublicProduct(row, role));
      }
    }
    if (catalog.length === 0) return [];
    return resolveEquipmentTonerPriceLines(product, catalog, { priceRole });
  }, [canShow, effectiveRole, hovering, product, queryCatalog, role]);

  if (!canShow) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children}
      {hovering && lines.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-2 top-2 z-20 md:inset-x-3">
          <TonerPricesPanel lines={lines} />
        </div>
      ) : null}
    </div>
  );
}
