import { useMemo, useState, type ReactNode } from 'react';

import { useAuth } from '@/context/auth-context';
import { formatHaitechPen } from '@/data/haitech-home-shop';
import { useProducts } from '@/hooks/use-products';
import { isColorPrinterEquipment, isPrinterEquipment } from '@/lib/build-product-detail';
import { getCatalogRows } from '@/lib/catalog-featured';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import {
  resolveEquipmentTonerPriceLines,
  selectPrinterTonerSet,
  type EquipmentTonerPriceLine,
} from '@/lib/product-card-toner-prices';
import { toPublicProduct } from '@/lib/pricing';
import { resolvePriceRole, type PriceRole } from '@/lib/roles';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductTonerPricesHoverProps {
  product: Product;
  children: ReactNode;
  className?: string;
  /** `below`: panel bajo el trigger (Precio Técnico). `overlay`: sobre la imagen. */
  placement?: 'below' | 'overlay';
  /** Si no se pasa, se infiere del nombre/categoría del equipo. */
  isColor?: boolean;
  priceRole?: PriceRole;
  saleRate?: number;
  /** Muestra el panel de tóner sin esperar hover. */
  alwaysVisible?: boolean;
}

const TONER_COLOR_DOT: Record<string, string> = {
  Negro: '#111111',
  Cyan: '#00A3E0',
  Magenta: '#C2185B',
  Amarillo: '#C9A000',
};

function tonerColorHex(label: string): string {
  return TONER_COLOR_DOT[label] ?? '#6B7280';
}

function TonerPriceAmount({ usd, pen }: { usd: number; pen: number }) {
  return (
    <span className="shrink-0 text-right text-[11px] leading-tight tabular-nums text-[#111111]">
      <span className="block font-semibold">{formatHaitechPen(pen)}</span>
      <span className="block text-[10px] font-medium text-[#8a93a3]">{formatTonerUsd(usd)}</span>
    </span>
  );
}

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

const GENERIC_TONER_THUMB = '/products/toner-418480.webp';

function TonerLineThumb({
  line,
  dot,
}: {
  line: EquipmentTonerPriceLine;
  dot: string;
}) {
  const [src, setSrc] = useState(line.image || GENERIC_TONER_THUMB);
  const [failed, setFailed] = useState(false);
  const showImage = !failed && Boolean(src);

  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-[#eef0f4] bg-white">
      {showImage ? (
        <img
          src={src}
          alt=""
          className="size-full object-contain p-0.5"
          loading="lazy"
          decoding="async"
          onError={() => {
            if (src !== GENERIC_TONER_THUMB) {
              setSrc(GENERIC_TONER_THUMB);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        <span className="flex size-full items-center justify-center" aria-hidden="true">
          <span className="size-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: dot }} />
        </span>
      )}
    </span>
  );
}

function TonerPricesPanel({
  lines,
  saleRate,
  isColor,
}: {
  lines: EquipmentTonerPriceLine[];
  saleRate?: number;
  isColor: boolean;
}) {
  const totalUsd = lines.reduce((sum, line) => sum + line.priceUsd, 0);
  const heading = isColor ? 'Tóners originales (4)' : 'Tóner original';

  return (
    <div
      role="dialog"
      aria-label={heading}
      className="w-full rounded-xl border border-[#e6e8ee] bg-white px-2.5 py-2 text-left shadow-[0_12px_28px_rgba(15,23,42,0.16)]"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#8a93a3]">
        {heading}
      </p>
      <ul className="mt-1.5 space-y-1.5">
        {lines.map((line) => {
          const pen = tonerPenFromUsd(line.priceUsd, saleRate);
          const dot = tonerColorHex(line.label);
          return (
            <li key={line.id} className="flex items-center justify-between gap-2">
              <TonerLineThumb line={line} dot={dot} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] leading-tight text-[#374151]">
                  Toner Original{' '}
                  <span className="font-bold" style={{ color: dot }}>
                    {line.label}
                  </span>
                </span>
                {line.code || line.yieldLabel ? (
                  <span className="mt-0.5 block truncate text-[10px] font-medium tabular-nums text-[#8a93a3]">
                    {[line.code, line.yieldLabel].filter(Boolean).join(' · ')}
                  </span>
                ) : null}
              </span>
              <TonerPriceAmount usd={line.priceUsd} pen={pen} />
            </li>
          );
        })}
      </ul>
      {lines.length > 1 ? (
        <p className="mt-1.5 flex items-end justify-between gap-2 border-t border-[#eef0f4] pt-1.5 text-[11px] text-[#111111]">
          <span className="font-semibold">Total</span>
          <TonerPriceAmount usd={totalUsd} pen={tonerPenFromUsd(totalUsd, saleRate)} />
        </p>
      ) : null}
    </div>
  );
}

/**
 * Al pasar el cursor muestra el costo de tóner del equipo:
 * B/N = 1 tóner; color = 4 tóners. Precios en USD y soles.
 */
export function ProductTonerPricesHover({
  product,
  children,
  className,
  placement = 'below',
  isColor: isColorProp,
  priceRole: priceRoleProp,
  saleRate,
  alwaysVisible = false,
}: ProductTonerPricesHoverProps) {
  const { effectiveRole, role } = useAuth();
  const canShow = isPrinterEquipment(product);
  const isColor = isColorProp ?? isColorPrinterEquipment(product);
  const [hovering, setHovering] = useState(false);
  const panelOpen = alwaysVisible || hovering;
  const { data: queryCatalog } = useProducts({ enabled: canShow && panelOpen });

  const lines = useMemo(() => {
    if (!canShow || !panelOpen) return [];
    const priceRole = priceRoleProp ?? resolvePriceRole(String(effectiveRole));
    let catalog: Product[] = queryCatalog ?? [];
    if (catalog.length === 0) {
      const rows = getCatalogRows();
      if (rows.length > 0) {
        catalog = rows.map((row) => toPublicProduct(row, role));
      }
    }
    const resolved = resolveEquipmentTonerPriceLines(product, catalog, {
      priceRole,
      maxLines: 12,
    });
    return selectPrinterTonerSet(resolved, isColor);
  }, [canShow, effectiveRole, isColor, panelOpen, priceRoleProp, product, queryCatalog, role]);

  if (!canShow) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  const panel =
    panelOpen && lines.length > 0 ? (
      <TonerPricesPanel
        lines={lines}
        {...(saleRate != null ? { saleRate } : {})}
        isColor={isColor}
      />
    ) : panelOpen ? (
      <div className="w-full rounded-md bg-[#F8FAFC] px-2 py-1 text-center text-[10px] leading-tight text-[#6B7280]">
        Sin tóner vinculado en catálogo
      </div>
    ) : null;

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={alwaysVisible ? undefined : () => setHovering(true)}
      onMouseLeave={alwaysVisible ? undefined : () => setHovering(false)}
      onFocus={alwaysVisible ? undefined : () => setHovering(true)}
      onBlur={
        alwaysVisible
          ? undefined
          : (event) => {
              const next = event.relatedTarget;
              if (next instanceof Node && event.currentTarget.contains(next)) return;
              setHovering(false);
            }
      }
    >
      {children}
      {panel ? (
        placement === 'overlay' ? (
          <div className="pointer-events-none absolute inset-x-2 top-2 z-20 md:inset-x-3">
            {panel}
          </div>
        ) : (
          <div className={cn('relative z-20 w-full', lines.length > 0 ? 'mt-1.5' : '-mt-0.5')}>
            {panel}
          </div>
        )
      ) : null}
    </div>
  );
}
