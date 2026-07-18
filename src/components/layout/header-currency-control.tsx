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
import type { DisplayCurrency, DualPriceOrder } from '@/types/display-currency';

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

/** Orden del selector: S/ · $ · dual (etiqueta del modo dual refleja el orden activo). */
export const CURRENCY_SYMBOL_TOGGLE_OPTIONS: {
  id: DisplayCurrency;
  label: string;
  ariaLabel: string;
}[] = [
  { id: 'PEN', label: 'S/', ariaLabel: 'Mostrar precios en soles' },
  { id: 'USD', label: '$', ariaLabel: 'Mostrar precios en dólares' },
  { id: 'BOTH', label: 'S/-$', ariaLabel: 'Mostrar precios en soles y dólares' },
];

function getBothModeLabel(dualPriceOrder: DualPriceOrder): string {
  return dualPriceOrder === 'pen-usd' ? 'S/-$' : '$-S/';
}

function getBothModeAriaLabel(dualPriceOrder: DualPriceOrder, isActive: boolean): string {
  if (!isActive) {
    return dualPriceOrder === 'pen-usd'
      ? 'Mostrar precios en soles y dólares'
      : 'Mostrar precios en dólares y soles';
  }
  return dualPriceOrder === 'pen-usd'
    ? 'Mostrar precios en soles y dólares (soles primero). Clic para invertir orden'
    : 'Mostrar precios en dólares y soles (dólares primero). Clic para invertir orden';
}

const darkCurrencyToggleGroupClass = 'inline-flex shrink-0 items-center gap-0.5';
const darkCurrencyToggleButtonClass =
  'min-h-6 rounded px-1.5 text-[0.65rem] font-semibold leading-none tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black';

type CurrencySymbolToggleProps = {
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

function CurrencySymbolToggle({
  className,
  buttonClassName,
  activeClassName = 'bg-[#E30613] text-white',
  inactiveClassName = 'text-white/55 hover:text-white/90',
}: CurrencySymbolToggleProps) {
  const { displayCurrency, setDisplayCurrency, dualPriceOrder, toggleDualPriceOrder } =
    useDisplayCurrency();

  const handleOptionClick = (optionId: DisplayCurrency) => {
    if (optionId === 'BOTH' && displayCurrency === 'BOTH') {
      toggleDualPriceOrder();
      return;
    }
    setDisplayCurrency(optionId);
  };

  return (
    <div
      role="group"
      aria-label="Moneda de visualización"
      className={cn(darkCurrencyToggleGroupClass, className)}
    >
      {CURRENCY_SYMBOL_TOGGLE_OPTIONS.map((option) => {
        const isActive = displayCurrency === option.id;
        const label =
          option.id === 'BOTH' ? getBothModeLabel(dualPriceOrder) : option.label;
        const ariaLabel =
          option.id === 'BOTH'
            ? getBothModeAriaLabel(dualPriceOrder, isActive)
            : option.ariaLabel;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            aria-label={ariaLabel}
            onClick={() => handleOptionClick(option.id)}
            className={cn(
              darkCurrencyToggleButtonClass,
              buttonClassName,
              isActive ? activeClassName : inactiveClassName,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DarkCurrencySymbolToggle({
  className,
  buttonClassName,
  activeClassName,
  inactiveClassName,
}: {
  className?: string;
  buttonClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}) {
  return (
    <CurrencySymbolToggle
      {...(className != null ? { className } : {})}
      {...(buttonClassName != null ? { buttonClassName } : {})}
      {...(activeClassName != null ? { activeClassName } : {})}
      {...(inactiveClassName != null ? { inactiveClassName } : {})}
    />
  );
}

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
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5 sm:gap-3 sm:px-2.5',
        className,
      )}
    >
      <Coins className="hidden size-4 shrink-0 text-red-600 sm:block" aria-hidden="true" />
      <CurrencySymbolToggle
        buttonClassName="min-h-8 rounded px-2 text-[0.65rem] sm:min-h-9 sm:px-2.5 sm:text-xs"
        activeClassName="bg-red-600 text-white shadow-sm"
        inactiveClassName="text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        className="rounded-md border border-border/80 bg-background p-0.5"
      />
    </div>
  );
}

/** Selector S/ / $ / $-S/ para header oscuro. */
export function HeaderDarkCurrencyControl({ className }: { className?: string }) {
  return (
    <div className={cn('flex shrink-0 items-center gap-1.5', className)} aria-label="Moneda de visualización">
      <Coins className="size-4 shrink-0 text-white/80" aria-hidden="true" />
      <DarkCurrencySymbolToggle />
    </div>
  );
}

/** Selector S/ / $ / $-S/ bajo el carrito. */
export function HeaderCurrencySymbolToggle({ className }: { className?: string }) {
  return (
    <CurrencySymbolToggle
      {...(className != null ? { className } : {})}
      buttonClassName="min-h-5 rounded px-1 text-[0.6rem]"
      activeClassName="bg-red-600 text-white"
      inactiveClassName="text-muted-foreground hover:text-foreground"
    />
  );
}

function CartExchangeRateText({
  saleRate,
  dark = false,
}: {
  saleRate: number;
  dark?: boolean;
}) {
  return (
    <>
      <span className="font-medium">T.C.</span>{' '}
      <span className={cn('font-semibold', dark ? 'text-white/80' : 'text-foreground')}>
        S/ {formatExchangeRate(saleRate)}
      </span>
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
  return (
    <CurrencySymbolToggle
      {...(className != null ? { className } : {})}
      buttonClassName="px-1.5"
      activeClassName="bg-red-600 text-white"
      inactiveClassName="text-neutral-400 hover:text-white"
    />
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
  dark = false,
}: {
  className?: string;
  saleRate: number;
  purchaseRate: number;
  compact?: boolean;
  dark?: boolean;
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
              ? dark
                ? 'text-white/65 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1A1A1A]'
                : 'text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-background'
              : 'text-neutral-400 transition-colors hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 focus-visible:ring-offset-black',
            className,
          )}
        >
          <span>
            {compact ? (
              <>
                <span className={cn('font-medium', dark ? 'text-white/55' : '')}>T.C.</span>{' '}
                <span className={cn('font-semibold', dark ? 'text-white/90' : 'text-foreground')}>
                  S/ {formatExchangeRate(saleRate)}
                </span>
              </>
            ) : (
              <ExchangeRateText saleRate={saleRate} purchaseRate={purchaseRate} />
            )}
          </span>
          <Pencil
            className={cn(
              'size-3 shrink-0',
              compact
                ? dark
                  ? 'text-white/45'
                  : 'text-muted-foreground'
                : 'text-neutral-500',
            )}
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

/** Moneda + T.C. Venta compacto en el header oscuro de la tienda. */
export function HeaderStoreCurrencyExchangeBlock({
  className,
  muted = false,
}: {
  className?: string;
  /** Tipografía más chica y gris (top bar). */
  muted?: boolean;
}) {
  const { saleRate, purchaseRate } = useSystemExchangeRates();
  const { isAdmin } = useAuth();

  if (muted) {
    return (
      <div
        className={cn(
          'group/currency relative inline-flex shrink-0 items-center gap-1.5 rounded px-1',
          'min-h-6 text-[0.6875rem] font-medium text-[#9a9a9a] transition-colors hover:text-[#b8b8b8] sm:text-xs',
          className,
        )}
      >
        <button
          type="button"
          className="inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
          aria-label="Moneda de visualización. Pasa el mouse para seleccionar."
        >
          <Coins className="size-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>Moneda</span>
        </button>

        {isAdmin ? (
          <AdminExchangeRateEditor
            saleRate={saleRate}
            purchaseRate={purchaseRate}
            compact
            dark
            className="hidden text-[inherit] sm:flex"
          />
        ) : (
          <span
            className="hidden whitespace-nowrap font-normal tabular-nums sm:inline"
            aria-label="Tipo de cambio de venta"
          >
            <span>T.C.</span> S/ {formatExchangeRate(saleRate)}
          </span>
        )}

        <div
          className={cn(
            'invisible absolute right-0 top-full z-50 mt-1 rounded-md border border-white/10 bg-[#111111] p-1 opacity-0 shadow-lg',
            'transition-all duration-150 group-hover/currency:visible group-hover/currency:opacity-100 group-focus-within/currency:visible group-focus-within/currency:opacity-100',
          )}
        >
          <DarkCurrencySymbolToggle
            buttonClassName="min-h-6 px-1.5 text-xs font-medium"
            inactiveClassName="text-neutral-400 hover:text-white"
            activeClassName="bg-[#E30613] text-white"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex shrink-0 items-center gap-1.5', className)}>
      <DarkCurrencySymbolToggle
        buttonClassName={
          muted ? 'min-h-6 px-1.5 text-xs font-medium' : 'min-h-5 px-1 text-[0.6rem]'
        }
        {...(muted
          ? {
              inactiveClassName: 'text-[#5a5a5a] hover:text-[#7a7a7a]',
              activeClassName: 'bg-[#E30613]/80 text-white/90',
            }
          : {})}
      />

      {isAdmin ? (
        <AdminExchangeRateEditor
          saleRate={saleRate}
          purchaseRate={purchaseRate}
          compact
          dark
          className={cn('hidden sm:flex', muted ? 'text-xs text-[#6b6b6b] sm:text-[0.8125rem]' : 'text-xs')}
        />
      ) : (
        <p
          className={cn(
            'hidden whitespace-nowrap tabular-nums sm:block',
            muted
              ? 'text-xs font-normal text-[#6b6b6b] sm:text-[0.8125rem]'
              : 'text-xs text-white/70',
          )}
          aria-label="Tipo de cambio de venta"
        >
          <span className={muted ? 'font-normal' : 'font-medium'}>T.C.</span>{' '}
          <span className={muted ? 'font-normal text-[#6b6b6b]' : 'font-semibold text-white/90'}>
            S/ {formatExchangeRate(saleRate)}
          </span>
        </p>
      )}
    </div>
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
