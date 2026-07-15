import { Info } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useLinkedPenUsdPrice } from '@/hooks/use-linked-pen-usd-price';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import { cn } from '@/lib/utils';
import {
  PRICE_ROLE_LABELS,
  type PriceRole,
  type ProductRolePrices,
} from '@/types/product';

interface InventoryPricesGridProps {
  purchasePriceUsd: number;
  onPurchaseChange: (value: string) => void;
  prices: ProductRolePrices;
  onPriceChange: (role: PriceRole, value: string) => void;
  purchaseFromSuppliers?: boolean;
}

/** Sale columns matching the mockup: Público · Mayorista · Técnico. */
const SALE_PRICE_COLUMNS: { key: PriceRole; label: string }[] = [
  { key: 'public', label: PRICE_ROLE_LABELS.public },
  { key: 'mayorista', label: PRICE_ROLE_LABELS.mayorista },
  { key: 'tecnico', label: PRICE_ROLE_LABELS.tecnico },
];

function UsdPriceInput({
  id,
  value,
  onChange,
  readOnly = false,
  required = false,
}: {
  id: string;
  value: number;
  onChange: (value: string) => void;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
        aria-hidden="true"
      >
        $
      </span>
      <Input
        id={id}
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        readOnly={readOnly}
        required={required}
        aria-readonly={readOnly || undefined}
        className={cn(
          'h-10 bg-background pl-7 pr-2 text-sm tabular-nums',
          readOnly && 'cursor-default bg-muted/50',
        )}
      />
    </div>
  );
}

function PenPriceInput({
  id,
  usdValue,
  onUsdChange,
  exchangeRate,
  readOnly = false,
  useCharm = true,
}: {
  id: string;
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
  readOnly?: boolean;
  /** Precio de compra: conversión exacta sin redondeo a centésima en 9. */
  useCharm?: boolean;
}) {
  const { penInput, handlePenChange, handlePenFocus, handlePenBlur } = useLinkedPenUsdPrice({
    usdValue,
    onUsdChange,
    exchangeRate,
    useCharm,
  });

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground"
        aria-hidden="true"
      >
        S/
      </span>
      <Input
        id={id}
        type="number"
        min={0}
        step={0.01}
        inputMode="decimal"
        value={penInput}
        onChange={(event) => handlePenChange(event.target.value)}
        onFocus={handlePenFocus}
        onBlur={handlePenBlur}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        className={cn(
          'h-10 bg-background pl-8 pr-2 text-sm tabular-nums',
          readOnly && 'cursor-default bg-muted/50',
        )}
      />
    </div>
  );
}

export function InventoryPricesGrid({
  purchasePriceUsd,
  onPurchaseChange,
  prices,
  onPriceChange,
  purchaseFromSuppliers = false,
}: InventoryPricesGridProps) {
  const { data: company } = useCompanySettings();
  const saleRate = normalizeUsdToPenRate(
    company?.usdToPenExchangeRate ?? getUsdToPenSaleRate(),
  );
  const purchaseRate = normalizeUsdToPenRate(
    company?.usdToPenPurchaseExchangeRate ??
      company?.usdToPenExchangeRate ??
      getUsdToPenPurchaseRate(),
  );
  const purchaseUsd = Number(purchasePriceUsd) || 0;
  const saleColumnTemplate = `3.25rem repeat(${SALE_PRICE_COLUMNS.length}, minmax(0, 1fr))`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Precio de compra</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">USD</p>
            <UsdPriceInput
              id="price-purchase-usd"
              value={purchaseUsd}
              onChange={onPurchaseChange}
              readOnly={purchaseFromSuppliers}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">PEN</p>
            <PenPriceInput
              id="price-purchase-pen"
              usdValue={purchaseUsd}
              onUsdChange={onPurchaseChange}
              exchangeRate={purchaseRate}
              readOnly={purchaseFromSuppliers}
              useCharm={false}
            />
          </div>
        </div>
        {purchaseFromSuppliers ? (
          <p className="text-xs text-muted-foreground">
            El costo de compra se calcula del menor valor entre proveedores.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Precios de venta (PEN)</Label>
        <div className="overflow-x-auto rounded-md border border-border/60 bg-muted/10 p-3">
          <div className="min-w-[28rem] space-y-2.5">
            <div className="grid gap-2" style={{ gridTemplateColumns: saleColumnTemplate }}>
              <p className="flex items-center text-xs font-medium text-muted-foreground">Rol</p>
              {SALE_PRICE_COLUMNS.map((column) => (
                <p
                  key={column.key}
                  className="px-0.5 text-center text-xs font-medium text-muted-foreground"
                >
                  {column.label}
                </p>
              ))}
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: saleColumnTemplate }}>
              <p className="flex items-center text-xs font-semibold text-muted-foreground">USD</p>
              {SALE_PRICE_COLUMNS.map((column) => (
                <UsdPriceInput
                  key={`usd-${column.key}`}
                  id={`price-${column.key}-usd`}
                  value={Number(prices[column.key]) || 0}
                  onChange={(value) => onPriceChange(column.key, value)}
                  required={column.key === 'public'}
                />
              ))}
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: saleColumnTemplate }}>
              <p className="flex items-center text-xs font-semibold text-muted-foreground">PEN</p>
              {SALE_PRICE_COLUMNS.map((column) => (
                <PenPriceInput
                  key={`pen-${column.key}`}
                  id={`price-${column.key}-pen`}
                  usdValue={Number(prices[column.key]) || 0}
                  onUsdChange={(value) => onPriceChange(column.key, value)}
                  exchangeRate={saleRate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-md border border-sky-200/80 bg-sky-50 px-3 py-2.5 text-xs leading-relaxed text-sky-900">
        <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" aria-hidden="true" />
        Los precios de venta se redondean a la centésima más cercana.
      </p>
    </div>
  );
}
