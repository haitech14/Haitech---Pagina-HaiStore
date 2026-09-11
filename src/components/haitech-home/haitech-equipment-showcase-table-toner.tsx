import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Link2, Package, Plus, Search, X } from 'lucide-react';

import { formatHaitechPen } from '@/data/haitech-home-shop';
import { useAuth } from '@/context/auth-context';
import { getCatalogRows, type CatalogRow } from '@/lib/catalog-featured';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import {
  resolveEquipmentTonerPriceLines,
  selectPrinterTonerSet,
  type EquipmentTonerPriceLine,
} from '@/lib/product-card-toner-prices';
import { productPath } from '@/lib/product-path';
import { toPublicProduct } from '@/lib/pricing';
import { resolvePriceRole } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { InventoryProduct, Product } from '@/types/product';

function tonerPenFromUsd(usd: number, saleRate?: number): number {
  const rate = saleRate && saleRate > 0 ? saleRate : DEFAULT_USD_TO_PEN;
  if (!Number.isFinite(usd) || usd <= 0) return 0;
  return Math.round(usd * rate * 100) / 100;
}

function formatTonerUsd(usd: number): string {
  const normalized = Math.round(usd * 100) / 100;
  const isWhole = Math.abs(normalized % 1) < 0.001;
  return `US$ ${normalized.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  })}`;
}

function isLikelyTonerRow(row: CatalogRow): boolean {
  const hay = `${row.name} ${row.category ?? ''} ${row.code ?? ''}`.toLowerCase();
  return /t[oó]ner|toner|cartucho/.test(hay);
}

export function ShowcaseTableTonerStockTrigger({
  expanded,
  onToggleStock,
  onToggleToner,
  stockCount,
  outOfStock,
}: {
  expanded: boolean;
  onToggleStock: () => void;
  onToggleToner: () => void;
  stockCount: number;
  outOfStock: boolean;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-1',
        expanded ? 'bg-[#E30613] text-white' : 'bg-[#FFF1F2] text-[#E30613]',
      )}
    >
      <button
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full hover:bg-black/10"
        aria-label={outOfStock ? 'Ver stock (sin unidades)' : `Ver stock (${stockCount})`}
        title="Stock"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleStock();
        }}
      >
        <Package className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="inline-flex size-6 items-center justify-center rounded-full hover:bg-black/10"
        aria-label="Ver costos de tóner"
        title="Tóner"
        aria-expanded={expanded}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleToner();
        }}
      >
        <Droplets className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ShowcaseTableTonerExpandPanel({
  equipmentProduct,
  catalogRow,
  isColor,
  saleRate,
  canManage,
  onLinkToner,
}: {
  equipmentProduct: Product;
  catalogRow?: CatalogRow;
  isColor: boolean;
  saleRate?: number;
  canManage: boolean;
  onLinkToner: (tonerId: string) => Promise<void>;
}) {
  const { effectiveRole } = useAuth();
  const [linking, setLinking] = useState(false);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const lines = useMemo(() => {
    const catalog = getCatalogRows().map((row) =>
      toPublicProduct(row, String(effectiveRole)),
    );
    const resolved = resolveEquipmentTonerPriceLines(equipmentProduct, catalog, {
      priceRole: resolvePriceRole(String(effectiveRole)),
      maxLines: 12,
    });
    return selectPrinterTonerSet(resolved, isColor);
  }, [effectiveRole, equipmentProduct, isColor]);

  const candidates = useMemo(() => {
    if (!linking) return [];
    const q = query.trim().toLowerCase();
    return getCatalogRows()
      .filter(isLikelyTonerRow)
      .filter((row) => {
        if (!q) return true;
        return `${row.name} ${row.code ?? ''} ${row.category ?? ''}`.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [linking, query]);

  return (
    <div className="space-y-3 rounded-lg border border-[#FECACA] bg-[#FFF8F8] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#E30613]">
          {isColor ? 'Costos de tóner (set color)' : 'Costo de tóner'}
        </p>
        {canManage ? (
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-[#FECACA] bg-white px-2 text-[11px] font-semibold text-[#E30613] hover:bg-[#FFF1F2]"
            onClick={() => setLinking((value) => !value)}
          >
            {linking ? (
              <>
                <X className="size-3.5" aria-hidden="true" />
                Cerrar
              </>
            ) : (
              <>
                <Plus className="size-3.5" aria-hidden="true" />
                Relacionar tóner
              </>
            )}
          </button>
        ) : null}
      </div>

      {lines.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {lines.map((line) => (
            <TonerCostCard key={line.id} line={line} saleRate={saleRate} />
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-[#6B7280]">
          No hay tóner vinculado. {canManage ? 'Usa «Relacionar tóner» para enlazar uno del inventario.' : ''}
        </p>
      )}

      {linking && canManage ? (
        <div className="space-y-2 rounded-md border border-[#E5E7EB] bg-white p-2.5">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar tóner por nombre o código…"
              className="h-8 w-full rounded-md border border-[#E5E7EB] bg-white pl-8 pr-2 text-[12px] outline-none focus:border-[#E30613]"
            />
          </label>
          <ul className="max-h-48 space-y-1 overflow-auto" role="list">
            {candidates.map((row) => {
              const already = (catalogRow?.cross_sell_product_ids ?? []).includes(row.id);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    disabled={busyId === row.id || already}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-[#F9FAFB] disabled:opacity-50"
                    onClick={async () => {
                      setBusyId(row.id);
                      try {
                        await onLinkToner(row.id);
                        setLinking(false);
                        setQuery('');
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    <Link2 className="size-3.5 shrink-0 text-[#E30613]" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-medium text-[#111]">
                      {row.name}
                    </span>
                    {row.code ? (
                      <span className="shrink-0 font-mono text-[10px] text-[#6B7280]">{row.code}</span>
                    ) : null}
                    {already ? (
                      <span className="shrink-0 text-[10px] font-semibold text-[#16A34A]">Ya vinculado</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {candidates.length === 0 ? (
              <li className="px-2 py-3 text-center text-[12px] text-[#9CA3AF]">
                No se encontraron tóners en inventario.
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TonerCostCard({
  line,
  saleRate,
}: {
  line: EquipmentTonerPriceLine;
  saleRate?: number;
}) {
  const pen = tonerPenFromUsd(line.priceUsd, saleRate);
  return (
    <li className="flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-2 py-1.5">
      <div className="min-w-0 flex-1">
        <Link
          to={productPath({ id: line.id, name: line.name || line.label })}
          className="block truncate text-[12px] font-semibold text-[#111] hover:text-[#E30613]"
        >
          {line.label}
          {line.code ? ` · ${line.code}` : ''}
        </Link>
        <p className="truncate text-[10px] text-[#6B7280]">{line.supplyType}</p>
      </div>
      <span className="shrink-0 text-right tabular-nums">
        <span className="block text-[12px] font-bold text-[#E30613]">{formatHaitechPen(pen)}</span>
        <span className="block text-[10px] text-[#8a93a3]">{formatTonerUsd(line.priceUsd)}</span>
      </span>
    </li>
  );
}

export function mergeCrossSellTonerId(
  product: Pick<InventoryProduct, 'cross_sell_product_ids'>,
  tonerId: string,
): string[] {
  const current = Array.isArray(product.cross_sell_product_ids)
    ? product.cross_sell_product_ids
    : [];
  if (current.includes(tonerId)) return current;
  return [...current, tonerId];
}
