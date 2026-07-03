import { useState, type FormEvent } from 'react';
import { Coins, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import {
  useCompanySettings,
  useCompanySettingsMutation,
} from '@/hooks/use-company-settings';
import { cn } from '@/lib/utils';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import type { DisplayCurrency } from '@/types/display-currency';

function formatExchangeRate(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function useSystemExchangeRates() {
  const { data: settings } = useCompanySettings();
  const saleRate =
    settings?.usdToPenExchangeRate ?? DEFAULT_COMPANY_SETTINGS.usdToPenExchangeRate;
  const purchaseRate =
    settings?.usdToPenPurchaseExchangeRate ??
    settings?.usdToPenExchangeRate ??
    DEFAULT_COMPANY_SETTINGS.usdToPenPurchaseExchangeRate;

  return { saleRate, purchaseRate };
}

const currencyOptions: { id: DisplayCurrency; label: string; shortLabel: string }[] = [
  { id: 'USD', label: 'Dólares', shortLabel: 'USD' },
  { id: 'PEN', label: 'Soles', shortLabel: 'PEN' },
  { id: 'BOTH', label: 'Ambos', shortLabel: 'Ambos' },
];

export function ExchangeRateDisplay({ className }: { className?: string }) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();

  return (
    <p
      className={cn(
        'shrink-0 whitespace-nowrap text-right text-[0.65rem] tabular-nums leading-tight text-muted-foreground sm:text-xs',
        className,
      )}
      aria-label="Tipo de cambio del sistema"
    >
      <span className="font-medium">Compra:</span>{' '}
      <span className="font-semibold text-foreground">S/ {formatExchangeRate(purchaseRate)}</span>
      <span className="mx-1.5 text-muted-foreground/60" aria-hidden="true">
        ·
      </span>
      <span className="font-medium">Venta:</span>{' '}
      <span className="font-semibold text-foreground">S/ {formatExchangeRate(saleRate)}</span>
    </p>
  );
}

export function HeaderCurrencyControl({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5 sm:gap-3 sm:px-2.5',
        className,
      )}
    >
      <Coins className="hidden size-4 shrink-0 text-red-600 sm:block" aria-hidden="true" />

      <div
        role="group"
        aria-label="Moneda de visualización"
        className="inline-flex shrink-0 rounded-md border border-border/80 bg-background p-0.5"
      >
        {currencyOptions.map((option) => {
          const isActive = displayCurrency === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setDisplayCurrency(option.id)}
              className={cn(
                'min-h-8 rounded px-2 text-[0.65rem] font-semibold transition-colors sm:min-h-9 sm:px-2.5 sm:text-xs',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1',
                isActive
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span className="sm:hidden">{option.shortLabel}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Selector $ / S/ / $S/ para header oscuro. */
export function HeaderDarkCurrencyControl({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  const symbolOptions: { id: DisplayCurrency; label: string; ariaLabel: string }[] = [
    { id: 'USD', label: '$', ariaLabel: 'Mostrar precios en dólares' },
    { id: 'PEN', label: 'S/', ariaLabel: 'Mostrar precios en soles' },
    { id: 'BOTH', label: '$S/', ariaLabel: 'Mostrar precios en dólares y soles' },
  ];

  return (
    <div
      className={cn('flex shrink-0 items-center gap-1.5', className)}
      aria-label="Moneda de visualización"
    >
      <Coins className="size-4 shrink-0 text-white/80" aria-hidden="true" />
      <div
        role="group"
        className="inline-flex shrink-0 items-center rounded-md border border-white/20 bg-white/10 p-0.5"
      >
        {symbolOptions.map((option) => {
          const isActive = displayCurrency === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              aria-label={option.ariaLabel}
              onClick={() => setDisplayCurrency(option.id)}
              className={cn(
                'min-h-6 min-w-6 rounded px-1.5 text-[0.65rem] font-semibold leading-none tabular-nums transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1A1A1A]',
                isActive
                  ? 'bg-[#E30613] text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Selector $ / S/ / $S/ bajo el carrito. */
export function HeaderCurrencySymbolToggle({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  const symbolOptions: { id: DisplayCurrency; label: string; ariaLabel: string }[] = [
    { id: 'USD', label: '$', ariaLabel: 'Mostrar precios en dólares' },
    { id: 'PEN', label: 'S/', ariaLabel: 'Mostrar precios en soles' },
    { id: 'BOTH', label: '$S/', ariaLabel: 'Mostrar precios en dólares y soles' },
  ];

  return (
    <div
      role="group"
      aria-label="Moneda de visualización"
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border border-border bg-muted/40 p-0.5',
        className,
      )}
    >
      {symbolOptions.map((option) => {
        const isActive = displayCurrency === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            onClick={() => setDisplayCurrency(option.id)}
            className={cn(
              'min-h-5 min-w-6 rounded px-1 text-[0.6rem] font-semibold leading-none tabular-nums transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              isActive
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CartExchangeRateText({ saleRate }: { saleRate: number }) {
  return (
    <>
      <span className="font-medium">T.C.</span>{' '}
      <span className="font-semibold text-foreground">S/ {formatExchangeRate(saleRate)}</span>
    </>
  );
}

/** Selector $ / S/ / $S/ y tipo de cambio junto al carrito. */
export function HeaderCartExchangeBar({ className }: { className?: string }) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();
  const { isAdmin } = useAuth();

  return (
    <div
      className={cn(
        'flex min-h-9 shrink-0 flex-row items-center gap-2 px-3 py-1',
        className,
      )}
    >
      <HeaderCurrencySymbolToggle />
      {isAdmin ? (
        <AdminExchangeRateEditor saleRate={saleRate} purchaseRate={purchaseRate} compact />
      ) : (
        <p
          className="shrink-0 whitespace-nowrap text-xs tabular-nums leading-tight text-muted-foreground"
          aria-label="Tipo de cambio de venta"
        >
          <CartExchangeRateText saleRate={saleRate} />
        </p>
      )}
    </div>
  );
}

/** Selector de moneda compacto para la barra superior negra. */
export function HeaderTopbarCurrencyToggle({ className }: { className?: string }) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  return (
    <div
      role="group"
      aria-label="Moneda de visualización"
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border border-neutral-700 bg-neutral-900 p-0.5',
        className,
      )}
    >
      {currencyOptions.map((option) => {
        const isActive = displayCurrency === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setDisplayCurrency(option.id)}
            className={cn(
              'min-h-6 rounded px-2 text-[0.65rem] font-semibold leading-none transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
              isActive
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white',
            )}
          >
            <span className="sm:hidden">{option.shortLabel}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ExchangeRateText({ saleRate, purchaseRate }: { saleRate: number; purchaseRate: number }) {
  return (
    <>
      <span className="font-medium">Compra:</span>{' '}
      <span className="font-semibold text-neutral-300">S/ {formatExchangeRate(purchaseRate)}</span>
      <span className="mx-1.5 text-neutral-500" aria-hidden="true">
        ·
      </span>
      <span className="font-medium">Venta:</span>{' '}
      <span className="font-semibold text-neutral-300">S/ {formatExchangeRate(saleRate)}</span>
    </>
  );
}

function AdminExchangeRateEditor({
  className,
  saleRate,
  purchaseRate,
  compact = false,
}: {
  className?: string;
  saleRate: number;
  purchaseRate: number;
  compact?: boolean;
}) {
  const { data: settings } = useCompanySettings();
  const mutation = useCompanySettingsMutation();
  const [open, setOpen] = useState(false);
  const [compra, setCompra] = useState('');
  const [venta, setVenta] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setCompra(purchaseRate.toFixed(2));
      setVenta(saleRate.toFixed(2));
      setError(null);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;

    const compraNum = Number(compra.replace(',', '.'));
    const ventaNum = Number(venta.replace(',', '.'));
    if (!Number.isFinite(compraNum) || compraNum <= 0 || !Number.isFinite(ventaNum) || ventaNum <= 0) {
      setError('Ingresa valores mayores a 0.');
      return;
    }

    setError(null);
    mutation.mutate(
      {
        ...settings,
        usdToPenPurchaseExchangeRate: compraNum,
        usdToPenExchangeRate: ventaNum,
      },
      {
        onSuccess: () => setOpen(false),
        onError: () => setError('No se pudo guardar. Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={compact ? 'Editar tipo de cambio de venta' : 'Editar tipo de cambio (Compra y Venta)'}
          className={cn(
            'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded text-right text-xs tabular-nums leading-tight',
            compact
              ? 'text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-background'
              : 'text-neutral-400 transition-colors hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
            className,
          )}
        >
          <span>
            {compact ? (
              <CartExchangeRateText saleRate={saleRate} />
            ) : (
              <ExchangeRateText saleRate={saleRate} purchaseRate={purchaseRate} />
            )}
          </span>
          <Pencil
            className={cn('size-3 shrink-0', compact ? 'text-muted-foreground' : 'text-neutral-500')}
            aria-hidden="true"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 p-3.5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Tipo de cambio USD → PEN
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="tc-compra" className="text-xs">
                Compra
              </Label>
              <Input
                id="tc-compra"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={compra}
                onChange={(event) => setCompra(event.target.value)}
                className="h-9 tabular-nums"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tc-venta" className="text-xs">
                Venta
              </Label>
              <Input
                id="tc-venta"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={venta}
                onChange={(event) => setVenta(event.target.value)}
                className="h-9 tabular-nums"
                required
              />
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-9 w-full bg-red-600 text-sm font-semibold hover:bg-red-500"
          >
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** TC Compra/Venta en barra superior negra (editable para administradores). */
export function HeaderExchangeRateStrip({ className }: { className?: string }) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return (
      <AdminExchangeRateEditor
        {...(className ? { className } : {})}
        saleRate={saleRate}
        purchaseRate={purchaseRate}
      />
    );
  }

  return (
    <p
      className={cn(
        'shrink-0 whitespace-nowrap text-right text-[0.65rem] tabular-nums leading-tight text-neutral-400 sm:text-xs',
        className,
      )}
      aria-label="Tipo de cambio del sistema"
    >
      <ExchangeRateText saleRate={saleRate} purchaseRate={purchaseRate} />
    </p>
  );
}
