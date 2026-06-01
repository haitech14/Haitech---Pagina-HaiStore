import { useEffect, useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useCompanySettings,
  useCompanySettingsMutation,
} from '@/hooks/use-company-settings';
import { normalizeUsdToPenRate } from '@/lib/exchange-rate';
import { cn, formatPenFromUsdPrecise, formatUsd } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';

function formatRate(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function AdminExchangeRateControl() {
  const { data: settings, isLoading } = useCompanySettings();
  const saveSettings = useCompanySettingsMutation();
  const [open, setOpen] = useState(false);
  const [saleRate, setSaleRate] = useState(DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate);
  const [purchaseRate, setPurchaseRate] = useState(
    DEFAULT_COMPANY_SETTINGS.usdToPenPurchaseExchangeRate,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings || !open) return;
    setSaleRate(settings.usdToPenExchangeRate);
    setPurchaseRate(
      settings.usdToPenPurchaseExchangeRate ?? settings.usdToPenExchangeRate,
    );
    setError(null);
  }, [settings, open]);

  const activeSale = settings?.usdToPenExchangeRate ?? saleRate;
  const activePurchase =
    settings?.usdToPenPurchaseExchangeRate ??
    settings?.usdToPenExchangeRate ??
    purchaseRate;

  const handleSave = async () => {
    if (!settings) return;
    setError(null);
    try {
      await saveSettings.mutateAsync({
        ...settings,
        usdToPenExchangeRate: normalizeUsdToPenRate(saleRate),
        usdToPenPurchaseExchangeRate: normalizeUsdToPenRate(purchaseRate),
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el tipo de cambio.');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'hidden items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-left transition-colors',
            'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'sm:inline-flex lg:px-3',
          )}
          aria-label="Tipo de cambio de la tienda. Pulsa para editar venta y compra."
        >
          <Coins className="size-4 shrink-0 text-[hsl(var(--admin-accent))]" aria-hidden="true" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de cambio
            </span>
            {isLoading ? (
              <span className="text-xs text-muted-foreground">Cargando…</span>
            ) : (
              <span className="truncate text-xs tabular-nums text-foreground">
                <span className="font-medium">Venta</span> {formatRate(activeSale)}
                <span className="mx-1 text-muted-foreground" aria-hidden="true">
                  ·
                </span>
                <span className="font-medium">Compra</span> {formatRate(activePurchase)}
              </span>
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,20rem)] p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Tipo de cambio general</p>
            <p className="text-xs text-muted-foreground">
              Aplica a toda la tienda. Venta: precios al cliente. Compra: costos del inventario.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topbar-tc-venta">Venta (USD → PEN)</Label>
            <Input
              id="topbar-tc-venta"
              type="number"
              min={0.01}
              step={0.01}
              inputMode="decimal"
              className="h-9 tabular-nums"
              value={saleRate}
              onChange={(event) => setSaleRate(Number(event.target.value) || 0)}
            />
            <p className="text-[0.65rem] text-muted-foreground tabular-nums">
              {formatUsd(1)} = {formatPenFromUsdPrecise(1, saleRate)}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topbar-tc-compra">Compra (USD → PEN)</Label>
            <Input
              id="topbar-tc-compra"
              type="number"
              min={0.01}
              step={0.01}
              inputMode="decimal"
              className="h-9 tabular-nums"
              value={purchaseRate}
              onChange={(event) => setPurchaseRate(Number(event.target.value) || 0)}
            />
            <p className="text-[0.65rem] text-muted-foreground tabular-nums">
              {formatUsd(1)} = {formatPenFromUsdPrecise(1, purchaseRate)}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-500"
            disabled={saveSettings.isPending || !settings}
            onClick={() => void handleSave()}
          >
            {saveSettings.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              'Guardar tipo de cambio'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
