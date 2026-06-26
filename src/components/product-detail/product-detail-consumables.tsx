import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import {
  formatCostPerCopyPen,
  formatYieldLabel,
} from '@/lib/product-cost-per-copy';
import {
  buildSparePartsDisplayGroups,
  flattenConsumableGroupItems,
  splitTonerItemsBySupplyType,
  sumCostPerCopyPen,
  type ConsumableGroup,
  type ConsumableItem,
} from '@/lib/product-equipment-consumables';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';

interface ProductDetailConsumablesProps {
  groups: ConsumableGroup[];
  className?: string;
}

function SparePartsRow({
  item,
  isToner,
}: {
  item: ConsumableGroup['items'][number];
  isToner: boolean;
}) {
  const displaySku =
    formatProductDisplayCode(item.sku, { name: item.name, isToner }) ?? item.sku?.trim() ?? null;

  return (
    <tr className="border-b border-border/50 last:border-b-0">
      <td className="py-1.5 pr-2 align-middle">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to={productPath(item.productId)}
            className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border/50 bg-muted/20 p-0.5 sm:size-10"
            aria-label={`Ver ${item.name}`}
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="px-0.5 text-center text-[0.5rem] font-medium leading-tight text-muted-foreground">
                N/D
              </span>
            )}
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {displaySku ? (
              <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                {displaySku}
              </span>
            ) : null}
            <Link
              to={productPath(item.productId)}
              className="min-w-0 text-sm font-semibold leading-snug text-[#0f1f3d] no-underline hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <span className="line-clamp-2">{item.name}</span>
            </Link>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap py-1.5 pr-2 align-middle text-sm font-semibold text-[#0f1f3d]">
        <DualPrice usd={item.priceUsd} />
      </td>
      <td className="py-1.5 pr-2 align-middle text-sm text-muted-foreground">
        {formatYieldLabel(item.yieldPages ?? null, item.yieldLabel ?? null)}
      </td>
      <td className="whitespace-nowrap py-1.5 align-middle text-sm font-semibold text-red-600">
        {formatCostPerCopyPen(item.costPerCopyPen)}
      </td>
    </tr>
  );
}

function SparePartsTable({
  items,
  isToner,
}: {
  items: ConsumableGroup['items'];
  isToner: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-border/60 bg-muted/20 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-2 py-2">
              Producto
            </th>
            <th scope="col" className="px-2 py-2">
              Precio
            </th>
            <th scope="col" className="px-2 py-2">
              Rendimiento
            </th>
            <th scope="col" className="px-2 py-2">
              Costo por copia
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {items.map((item) => (
            <SparePartsRow key={item.productId} item={item} isToner={isToner} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type TonerSupplyType = 'original' | 'compatible';

function TonerSupplyTypeSection({ items }: { items: ConsumableItem[] }) {
  const { original, compatible } = splitTonerItemsBySupplyType(items);
  const tabListId = useId();
  const originalPanelId = useId();
  const compatiblePanelId = useId();
  const [supplyType, setSupplyType] = useState<TonerSupplyType>(() =>
    original.length > 0 ? 'original' : 'compatible',
  );

  const activeItems = supplyType === 'original' ? original : compatible;
  const activePanelId = supplyType === 'original' ? originalPanelId : compatiblePanelId;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Tipo de tóner"
        id={tabListId}
        className="flex w-full gap-2 sm:max-w-md"
      >
        {(
          [
            { id: 'original' as const, label: 'Original', count: original.length },
            { id: 'compatible' as const, label: 'Compatible', count: compatible.length },
          ] as const
        ).map((option) => {
          const isActive = supplyType === option.id;
          const panelId = option.id === 'original' ? originalPanelId : compatiblePanelId;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              id={`${tabListId}-${option.id}`}
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => setSupplyType(option.id)}
              className={cn(
                'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                isActive
                  ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                  : 'border-border/80 bg-card text-foreground hover:border-border hover:bg-muted/40',
              )}
            >
              {option.label}
              {option.count > 0 ? (
                <span
                  className={cn(
                    'ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-bold leading-none',
                    isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {option.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={activePanelId}
        aria-labelledby={`${tabListId}-${supplyType}`}
        className="w-full"
      >
        {activeItems.length > 0 ? (
          <SparePartsTable items={activeItems} isToner />
        ) : (
          <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
            Sin productos catalogados.
          </p>
        )}
      </div>
    </div>
  );
}

export function ProductDetailConsumables({ groups, className }: ProductDetailConsumablesProps) {
  const displayGroups = buildSparePartsDisplayGroups(groups);
  const allItems = flattenConsumableGroupItems(displayGroups);
  const totalCostPerCopy = sumCostPerCopyPen(allItems);
  const itemsWithCost = allItems.filter((item) => item.costPerCopyPen != null && item.costPerCopyPen > 0);

  if (displayGroups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay repuestos ni tóner catalogados para este equipo por el momento.
      </p>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Costo por copia = precio del producto ÷ rendimiento (páginas). La sumatoria incluye solo
        ítems con rendimiento conocido.
      </p>

      {displayGroups.map((group) => (
        <section key={group.id} aria-labelledby={`repuesto-${group.id}`}>
          <h3
            id={`repuesto-${group.id}`}
            className="border-b-2 border-red-600 pb-2 text-base font-bold text-red-600 sm:text-lg"
          >
            {group.label}
          </h3>

          <div className="mt-4">
            {group.id === 'toner' ? (
              <TonerSupplyTypeSection items={group.items} />
            ) : (
              <SparePartsTable items={group.items} isToner={false} />
            )}
          </div>
        </section>
      ))}

      {itemsWithCost.length > 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#0f1f3d]">
              Sumatoria costo por copia ({itemsWithCost.length}{' '}
              {itemsWithCost.length === 1 ? 'producto' : 'productos'})
            </p>
            <p className="text-lg font-bold text-red-600">{formatCostPerCopyPen(totalCostPerCopy)}</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Suma de los costos por copia de tóner y repuestos listados con rendimiento definido.
          </p>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        <Link
          to="/tienda"
          className="inline-flex items-center gap-0.5 font-semibold text-red-600 hover:text-red-500"
        >
          Ver catálogo de suministros
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
      </p>
    </div>
  );
}
