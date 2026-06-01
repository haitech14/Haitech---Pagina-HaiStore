import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface InventoryRolePricesFieldsetProps {
  purchasePriceUsd: number;
  onPurchaseChange: (value: string) => void;
  prices: ProductRolePrices;
  onPriceChange: (role: PriceRole, value: string) => void;
  idPrefix?: string;
  /** Si hay proveedores, el costo de compra se calcula del menor precio. */
  purchaseFromSuppliers?: boolean;
}

function PriceField({
  id,
  label,
  hint,
  usdValue,
  onUsdChange,
  exchangeRate,
  required,
  readOnly,
}: {
  id: string;
  label: string;
  hint?: string;
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
  required?: boolean;
  readOnly?: boolean;
}) {
  const penFromUsd = usdToPenCharm(usdValue, exchangeRate);
  const [penInput, setPenInput] = useState(String(penFromUsd || ''));

  useEffect(() => {
    setPenInput(penFromUsd > 0 ? String(penFromUsd) : '');
  }, [penFromUsd]);

  const handleUsdChange = (raw: string) => {
    onUsdChange(raw);
  };

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

  const penId = `${id}-pen`;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-1.5 flex min-h-[2.35rem] flex-col justify-end">
        <Label htmlFor={id} className="text-xs font-medium leading-tight">
          {label}
        </Label>
        <p
          id={`${id}-hint`}
          className={cn(
            'text-[0.65rem] leading-tight text-muted-foreground',
            !hint && 'invisible select-none',
          )}
          aria-hidden={!hint}
        >
          {hint ?? '—'}
        </p>
      </div>

      <div className="space-y-1">
        <div className="relative">
          <span
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] font-medium text-muted-foreground"
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
            value={usdValue || ''}
            onChange={(event) => handleUsdChange(event.target.value)}
            required={required}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            className={cn(
              'h-9 pl-5 pr-2 text-sm tabular-nums',
              readOnly && 'cursor-default bg-muted/60',
            )}
            aria-describedby={[hint ? `${id}-hint` : null, penId].filter(Boolean).join(' ') || undefined}
          />
        </div>

        <div className="relative">
          <span
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] font-medium text-muted-foreground"
            aria-hidden="true"
          >
            S/
          </span>
          <Input
            id={penId}
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={penInput}
            onChange={(event) => handlePenChange(event.target.value)}
            readOnly={readOnly}
            aria-readonly={readOnly || undefined}
            className={cn(
              'h-9 pl-7 pr-2 text-sm tabular-nums',
              readOnly && 'cursor-default bg-muted/60',
            )}
            aria-label={`${label} en soles`}
          />
        </div>
      </div>
    </div>
  );
}

export function InventoryRolePricesFieldset({
  purchasePriceUsd,
  onPurchaseChange,
  prices,
  onPriceChange,
  idPrefix = 'price',
  purchaseFromSuppliers = false,
}: InventoryRolePricesFieldsetProps) {
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

  return (
    <fieldset className="rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">Precios (USD / PEN)</legend>
      <p className="mb-2 text-xs text-muted-foreground">
        Los soles se redondean a enteros terminados en 9 (ej. 2 188 → 2 199). Puedes editar
        cualquiera de las dos monedas.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <PriceField
          id={`${idPrefix}-purchase`}
          label="Compra"
          {...(purchaseFromSuppliers ? { hint: 'Menor entre proveedores' } : {})}
          usdValue={purchaseUsd}
          onUsdChange={onPurchaseChange}
          exchangeRate={purchaseRate}
          readOnly={purchaseFromSuppliers}
        />
        {PRICE_ROLES_EDIT_ORDER.map((priceRole) => {
          const usd = Number(prices[priceRole]) || 0;
          return (
            <PriceField
              key={priceRole}
              id={`${idPrefix}-${priceRole}`}
              label={PRICE_ROLE_LABELS[priceRole]}
              usdValue={usd}
              onUsdChange={(value) => onPriceChange(priceRole, value)}
              exchangeRate={saleRate}
              required={priceRole === 'public'}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
