import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useCompanySettings } from '@/hooks/use-company-settings';
import {
  getUsdToPenPurchaseRate,
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import {
  penCharmToUsd,
  roundPenCharm99,
  usdToPenCharm,
} from '@/lib/pen-pricing';
import { cn } from '@/lib/utils';
import {
  PRICE_ROLE_LABELS,
  PRICE_ROLES_EDIT_ORDER,
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

type PriceColumn = 'purchase' | PriceRole;

const PRICE_COLUMNS: { key: PriceColumn; label: string }[] = [
  { key: 'purchase', label: 'Compra' },
  ...PRICE_ROLES_EDIT_ORDER.map((role) => ({
    key: role,
    label: PRICE_ROLE_LABELS[role],
  })),
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
        value={value || ''}
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
}: {
  id: string;
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
  readOnly?: boolean;
}) {
  const penFromUsd = usdToPenCharm(usdValue, exchangeRate);
  const [penInput, setPenInput] = useState(penFromUsd > 0 ? String(penFromUsd) : '');

  useEffect(() => {
    setPenInput(penFromUsd > 0 ? String(penFromUsd) : '');
  }, [penFromUsd]);

  const handlePenChange = (raw: string) => {
    const parsed = Number(raw);
    if (!raw.trim() || !Number.isFinite(parsed) || parsed < 0) {
      setPenInput(raw);
      if (!raw.trim()) onUsdChange('0');
      return;
    }
    const charm = roundPenCharm99(parsed);
    setPenInput(String(charm));
    onUsdChange(String(penCharmToUsd(charm, exchangeRate)));
  };

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
        step={1}
        inputMode="numeric"
        value={penInput}
        onChange={(event) => handlePenChange(event.target.value)}
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

  const columnTemplate = `3.25rem repeat(${PRICE_COLUMNS.length}, minmax(0, 1fr))`;

  const getUsdValue = (key: PriceColumn) =>
    key === 'purchase' ? purchaseUsd : Number(prices[key]) || 0;

  const handleUsdChange = (key: PriceColumn, value: string) => {
    if (key === 'purchase') {
      onPurchaseChange(value);
      return;
    }
    onPriceChange(key, value);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="min-w-[32rem] space-y-2.5">
          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <div />
            {PRICE_COLUMNS.map((column) => (
              <p
                key={column.key}
                className="px-0.5 text-center text-xs font-medium text-muted-foreground"
              >
                {column.label}
              </p>
            ))}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <p className="flex items-center text-xs font-semibold text-muted-foreground">USD</p>
            {PRICE_COLUMNS.map((column) => (
              <UsdPriceInput
                key={`usd-${column.key}`}
                id={`price-${column.key}-usd`}
                value={getUsdValue(column.key)}
                onChange={(value) => handleUsdChange(column.key, value)}
                readOnly={column.key === 'purchase' && purchaseFromSuppliers}
                required={column.key === 'public'}
              />
            ))}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <p className="flex items-center text-xs font-semibold text-muted-foreground">PEN</p>
            {PRICE_COLUMNS.map((column) => (
              <PenPriceInput
                key={`pen-${column.key}`}
                id={`price-${column.key}-pen`}
                usdValue={getUsdValue(column.key)}
                onUsdChange={(value) => handleUsdChange(column.key, value)}
                exchangeRate={column.key === 'purchase' ? purchaseRate : saleRate}
                readOnly={column.key === 'purchase' && purchaseFromSuppliers}
              />
            ))}
          </div>
        </div>
      </div>

      {purchaseFromSuppliers ? (
        <p className="text-xs text-muted-foreground">
          El precio de compra se calcula del menor valor entre proveedores.
        </p>
      ) : null}
    </div>
  );
}
