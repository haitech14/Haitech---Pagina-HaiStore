import { useMemo, useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompanySettings } from '@/hooks/use-company-settings';
import { useLinkedPenUsdPrice } from '@/hooks/use-linked-pen-usd-price';
import {
  getUsdToPenSaleRate,
  normalizeUsdToPenRate,
} from '@/lib/exchange-rate';
import {
  createEmptyVolumeRolePriceTier,
  type ProductVolumeRolePriceTier,
} from '@/lib/product-volume-role-prices';
import { ensureFullPrices } from '@/lib/roles';
import { cn } from '@/lib/utils';
import {
  PRICE_ROLE_LABELS,
  PRICE_ROLES_EDIT_ORDER,
  type PriceRole,
  type ProductRolePrices,
} from '@/types/product';

interface InventoryVolumeRolePricesSectionProps {
  tiers: ProductVolumeRolePriceTier[];
  basePrices: ProductRolePrices;
  onChange: (tiers: ProductVolumeRolePriceTier[]) => void;
  /** Collapsed row with «Configurar tramos» matching the mockup. */
  compact?: boolean;
}

function TierRolePenInput({
  id,
  usdValue,
  onUsdChange,
  exchangeRate,
}: {
  id: string;
  usdValue: number;
  onUsdChange: (value: string) => void;
  exchangeRate: number;
}) {
  const { penInput, handlePenChange, handlePenFocus, handlePenBlur } = useLinkedPenUsdPrice({
    usdValue,
    onUsdChange,
    exchangeRate,
    useCharm: true,
  });

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[0.65rem] font-medium text-muted-foreground"
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
        className="h-9 bg-background pl-7 pr-2 text-xs tabular-nums"
      />
    </div>
  );
}

function TierRoleUsdInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
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
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 bg-background pl-6 pr-2 text-xs tabular-nums"
      />
    </div>
  );
}

function VolumeTierCard({
  tier,
  index,
  exchangeRate,
  basePrices,
  onUpdate,
  onRemove,
}: {
  tier: ProductVolumeRolePriceTier;
  index: number;
  exchangeRate: number;
  basePrices: ProductRolePrices;
  onUpdate: (patch: Partial<ProductVolumeRolePriceTier>) => void;
  onRemove: () => void;
}) {
  const columnTemplate = `minmax(4.5rem, 0.75fr) repeat(${PRICE_ROLES_EDIT_ORDER.length}, minmax(0, 1fr))`;

  const updateRolePrice = (role: PriceRole, value: string) => {
    onUpdate({
      prices: {
        ...tier.prices,
        [role]: Number(value) || 0,
      },
    });
  };

  return (
    <div className="rounded-md border border-border/70 bg-muted/15 p-3">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-[8rem] flex-1">
          <Label htmlFor={`volume-tier-range-${tier.id}`} className="text-xs font-medium">
            Cantidad mínima
          </Label>
          <Input
            id={`volume-tier-range-${tier.id}`}
            value={tier.range}
            placeholder="Ej. 2, 5 o 10+"
            className="mt-1 h-9 bg-background text-sm"
            onChange={(event) => onUpdate({ range: event.target.value })}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Eliminar tramo ${index + 1}`}
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[28rem] space-y-2">
          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <div />
            {PRICE_ROLES_EDIT_ORDER.map((role) => (
              <p
                key={role}
                className="px-0.5 text-center text-[0.65rem] font-medium text-muted-foreground"
              >
                {PRICE_ROLE_LABELS[role]}
              </p>
            ))}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <p className="flex items-center text-[0.65rem] font-semibold text-muted-foreground">USD</p>
            {PRICE_ROLES_EDIT_ORDER.map((role) => (
              <TierRoleUsdInput
                key={`${tier.id}-usd-${role}`}
                id={`volume-tier-${tier.id}-${role}-usd`}
                value={tier.prices[role]}
                onChange={(value) => updateRolePrice(role, value)}
              />
            ))}
          </div>

          <div className="grid gap-2" style={{ gridTemplateColumns: columnTemplate }}>
            <p className="flex items-center text-[0.65rem] font-semibold text-muted-foreground">PEN</p>
            {PRICE_ROLES_EDIT_ORDER.map((role) => (
              <TierRolePenInput
                key={`${tier.id}-pen-${role}`}
                id={`volume-tier-${tier.id}-${role}-pen`}
                usdValue={tier.prices[role]}
                onUsdChange={(value) => updateRolePrice(role, value)}
                exchangeRate={exchangeRate}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-[0.65rem] text-muted-foreground">
        Referencia unitaria (1 ud.):{' '}
        {PRICE_ROLES_EDIT_ORDER.map((role, roleIndex) => (
          <span key={role}>
            {roleIndex > 0 ? ' · ' : ''}
            {PRICE_ROLE_LABELS[role]} ${Number(basePrices[role] || 0).toFixed(2)}
          </span>
        ))}
      </p>
    </div>
  );
}

export function InventoryVolumeRolePricesSection({
  tiers,
  basePrices,
  onChange,
  compact = false,
}: InventoryVolumeRolePricesSectionProps) {
  const { data: company } = useCompanySettings();
  const saleRate = normalizeUsdToPenRate(
    company?.usdToPenExchangeRate ?? getUsdToPenSaleRate(),
  );
  const normalizedBase = useMemo(() => ensureFullPrices(basePrices), [basePrices]);
  const [expanded, setExpanded] = useState(tiers.length > 0);

  const updateTier = (index: number, patch: Partial<ProductVolumeRolePriceTier>) => {
    onChange(
      tiers.map((tier, tierIndex) => (tierIndex === index ? { ...tier, ...patch } : tier)),
    );
  };

  const addTier = () => {
    const next = createEmptyVolumeRolePriceTier();
    onChange([
      ...tiers,
      {
        ...next,
        prices: { ...normalizedBase },
      },
    ]);
    setExpanded(true);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, tierIndex) => tierIndex !== index));
  };

  const editor = (
    <div className="space-y-3">
      {tiers.length === 0 ? (
        <p
          className={cn(
            'rounded-md border border-dashed border-border/70 bg-muted/10 px-3 py-4 text-xs text-muted-foreground',
          )}
        >
          Sin tramos personalizados. Agrega uno para fijar precios por volumen en este producto.
        </p>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <VolumeTierCard
              key={tier.id}
              tier={tier}
              index={index}
              exchangeRate={saleRate}
              basePrices={normalizedBase}
              onUpdate={(patch) => updateTier(index, patch)}
              onRemove={() => removeTier(index)}
            />
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" className="h-9" onClick={addTier}>
        <Plus className="size-4" aria-hidden="true" />
        Agregar tramo
      </Button>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Precios por volumen por rol (opcional)
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tiers.length > 0
                  ? `${tiers.length} tramo${tiers.length === 1 ? '' : 's'} configurado${tiers.length === 1 ? '' : 's'}.`
                  : 'Define precios unitarios por cantidad y rol.'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Ocultar tramos' : 'Configurar tramos'}
          </Button>
        </div>
        {expanded ? editor : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <div className="flex items-start gap-2">
        <Layers className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Precios por volumen por rol</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Opcional. Define precios unitarios por cantidad y rol (mayorista, técnico, etc.). Si no
            configuras tramos, se aplican los descuentos globales de la tienda sobre el precio
            público.
          </p>
        </div>
      </div>
      {editor}
    </div>
  );
}
