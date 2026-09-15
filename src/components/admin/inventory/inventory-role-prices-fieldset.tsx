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
  PRICE_ROLES_EDIT_ORDER,
  type PriceRole,
  type ProductRolePrices,
} from '@/types/product';

interface InventoryRolePricesFieldsetProps {
  purchasePriceUsd: number;
  onPurchaseChange: (value: string) => void;
  specialPurchasePriceUsd?: number;
  onSpecialPurchaseChange?: (value: string) => void;
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
  useCharm = true,
}: {
  id: string;
  label: string;
  hint?: string;
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
  required?: boolean;
  readOnly?: boolean;
  useCharm?: boolean;
}) {
  const { penInput, handlePenChange, handlePenFocus, handlePenBlur } = useLinkedPenUsdPrice({
    usdValue,
    onUsdChange,
    exchangeRate,
    useCharm,
  });

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
            onChange={(event) => onUsdChange(event.target.value)}
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
            step={0.01}
            inputMode="decimal"
            value={penInput}
            onChange={(event) => handlePenChange(event.target.value)}
            onFocus={handlePenFocus}
            onBlur={handlePenBlur}
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
  specialPurchasePriceUsd = 0,
  onSpecialPurchaseChange,
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
        Puedes ingresar el precio en dólares o en soles; al editar una moneda se actualiza la otra.
        Los precios de venta en soles se redondean a la centésima terminada en 9 al salir del
        campo (ej. 10.04 → 10.09). El precio de compra conserva el tipo de cambio exacto.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <PriceField
          id={`${idPrefix}-purchase`}
          label="Compra"
          {...(purchaseFromSuppliers ? { hint: 'Menor entre proveedores' } : {})}
          usdValue={purchaseUsd}
          onUsdChange={onPurchaseChange}
          exchangeRate={purchaseRate}
          readOnly={purchaseFromSuppliers}
          useCharm={false}
        />
        <PriceField
          id={`${idPrefix}-purchase-special`}
          label="Precio especial"
          hint="Variante de compra"
          usdValue={Number(specialPurchasePriceUsd) || 0}
          onUsdChange={onSpecialPurchaseChange ?? (() => undefined)}
          exchangeRate={purchaseRate}
          useCharm={false}
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
