import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, CalendarDays, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productHasNuevoCornerBadge } from '@/lib/product-detail-badges';
import {
  RENTAL_BLACK_COPY_COST_PEN,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_MIN_TERM_FOR_FREE_SETUP,
  RENTAL_SETUP_FEE_PEN,
  RENTAL_TERM_OPTIONS,
  calculateRentalQuote,
  formatPen,
  type RentalTermMonths,
} from '@/lib/rental-calculator';
import { ensureFullPrices } from '@/lib/roles';
import { cn, usdToPen } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailRentalBannerProps {
  product: Product;
  plans: RentalPlanOption[];
  className?: string;
}

export function ProductDetailRentalBanner({
  product,
  plans,
  className,
}: ProductDetailRentalBannerProps) {
  const [open, setOpen] = useState(false);
  const [termMonths, setTermMonths] = useState<RentalTermMonths>(6);
  const [monthlyPages, setMonthlyPages] = useState(RENTAL_DEFAULT_MONTHLY_PAGES);
  const [includesPaper, setIncludesPaper] = useState(true);
  const [includesOperator, setIncludesOperator] = useState(false);

  const isNuevo = productHasNuevoCornerBadge(product);
  const publicPricePen = usdToPen(
    ensureFullPrices(product.prices ?? { public: product.price }).public,
  );

  const fromMonthlyPen = useMemo(() => {
    if (plans.length === 0) return 0;
    let min = Number.POSITIVE_INFINITY;
    for (const months of RENTAL_TERM_OPTIONS) {
      const estimate = calculateRentalQuote({
        termMonths: months,
        monthlyPages: RENTAL_DEFAULT_MONTHLY_PAGES,
        includesPaper: true,
        includesOperator: false,
        plans,
      });
      if (estimate.monthlySubtotalPen < min) {
        min = estimate.monthlySubtotalPen;
      }
    }
    return min === Number.POSITIVE_INFINITY ? 0 : min;
  }, [plans]);

  const quote = useMemo(
    () =>
      calculateRentalQuote({
        termMonths,
        monthlyPages,
        includesPaper,
        includesOperator,
        plans,
      }),
    [termMonths, monthlyPages, includesPaper, includesOperator, plans],
  );

  const monthlyFixedCostPen = isNuevo
    ? Math.round((publicPricePen / termMonths) * 100) / 100
    : null;
  const monthlyTotalPen =
    Math.round((quote.monthlySubtotalPen + (monthlyFixedCostPen ?? 0)) * 100) / 100;
  const contractTotalPen =
    Math.round((monthlyTotalPen * termMonths + quote.setupFeePen) * 100) / 100;

  const panelId = 'rental-simulator-panel';

  if (plans.length === 0) return null;

  const contactHref =
    `/contacto?servicio=${encodeURIComponent(product.name)}` +
    `&alquiler=${termMonths}m` +
    `&paginas=${quote.monthlyPages}` +
    `&papel=${includesPaper ? '1' : '0'}` +
    `&operador=${includesOperator ? '1' : '0'}`;

  return (
    <section
      aria-labelledby="rental-banner-title"
      className={cn(
        'overflow-hidden rounded-xl border border-foreground/15 bg-background',
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/15 bg-background text-foreground"
          aria-hidden="true"
        >
          <CalendarDays className="size-5" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            id="rental-banner-title"
            className="block text-base font-bold text-foreground sm:text-lg"
          >
            Alquílalo desde S/ {formatPen(fromMonthlyPen)} mensual
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
            {open
              ? 'Simula plazo, producción mensual y servicios incluidos.'
              : '¿Prefieres alquilarla? Toca para simular tu plan.'}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'mt-1 size-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
      <div id={panelId} className="space-y-4 p-4 sm:p-5">
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plazo de alquiler
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {RENTAL_TERM_OPTIONS.map((months) => {
              const selected = termMonths === months;
              return (
                <button
                  key={months}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTermMonths(months)}
                  className={cn(
                    'min-h-11 rounded-lg border px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    selected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted/40',
                  )}
                >
                  {months} meses
                </button>
              );
            })}
          </div>
          {termMonths < RENTAL_MIN_TERM_FOR_FREE_SETUP ? (
            <p className="mt-2 text-xs text-muted-foreground" role="note">
              Plazos menores a {RENTAL_MIN_TERM_FOR_FREE_SETUP} meses incluyen instalación y transporte
              único de S/ {formatPen(RENTAL_SETUP_FEE_PEN)}.
            </p>
          ) : null}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rental-monthly-pages" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Producción mensual (ejemplo)
            </Label>
            <Input
              id="rental-monthly-pages"
              type="number"
              min={1}
              step={500}
              value={monthlyPages}
              onChange={(event) => setMonthlyPages(Math.max(1, Number(event.target.value) || 1))}
              className="h-11 tabular-nums"
            />
            <p className="text-xs text-muted-foreground">
              Referencia: {RENTAL_DEFAULT_MONTHLY_PAGES.toLocaleString('es-PE')} páginas/mes.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Servicios incluidos
            </legend>
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="rental-includes-paper"
                checked={includesPaper}
                onCheckedChange={(checked) => setIncludesPaper(checked === true)}
              />
              <Label htmlFor="rental-includes-paper" className="text-sm font-normal leading-snug">
                Incluye papel
              </Label>
            </div>
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="rental-includes-operator"
                checked={includesOperator}
                onCheckedChange={(checked) => setIncludesOperator(checked === true)}
              />
              <Label htmlFor="rental-includes-operator" className="text-sm font-normal leading-snug">
                Incluye operador
              </Label>
            </div>
          </fieldset>
        </div>

        <div
          className="rounded-lg border border-border/60 bg-muted/20 p-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calculator className="size-4 shrink-0" aria-hidden="true" />
            Estimación mensual
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted-foreground">
                Cuota base ({quote.includedPages.toLocaleString('es-PE')} pág. plan)
              </dt>
              <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                S/ {formatPen(quote.baseMonthlyPen)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-muted-foreground">
                Copia negro ({quote.monthlyPages.toLocaleString('es-PE')} × S/{' '}
                {RENTAL_BLACK_COPY_COST_PEN.toFixed(2)})
              </dt>
              <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                S/ {formatPen(quote.copyChargesPen)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3 text-xs">
              <dt className="text-muted-foreground">Papel</dt>
              <dd className={includesPaper ? 'text-foreground' : 'text-amber-700'}>
                {includesPaper ? 'Incluido' : 'No incluido (costo adicional)'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3 text-xs">
              <dt className="text-muted-foreground">Operador</dt>
              <dd className={includesOperator ? 'text-foreground' : 'text-amber-700'}>
                {includesOperator ? 'Incluido' : 'No incluido (costo adicional)'}
              </dd>
            </div>
            {quote.extraPages > 0 ? (
              <div className="flex items-start justify-between gap-3 text-xs">
                <dt className="text-muted-foreground">
                  Páginas sobre el plan ({quote.extraPages.toLocaleString('es-PE')})
                </dt>
                <dd className="text-muted-foreground">Incluidas en copia negro</dd>
              </div>
            ) : null}
            {monthlyFixedCostPen != null ? (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">
                  Costo fijo mensual (equipo nuevo, {termMonths} meses)
                </dt>
                <dd className="shrink-0 font-semibold tabular-nums text-foreground">
                  S/ {formatPen(monthlyFixedCostPen)}
                </dd>
              </div>
            ) : null}
            <div className="border-t border-border/60 pt-2">
              <div className="flex items-center justify-between gap-3 font-bold text-foreground">
                <dt>Total mensual estimado</dt>
                <dd className="tabular-nums">S/ {formatPen(monthlyTotalPen)}</dd>
              </div>
            </div>
            {quote.setupFeePen > 0 ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">Instalación y transporte (único)</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  S/ {formatPen(quote.setupFeePen)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-base font-bold text-foreground">
              <dt>Total contrato ({quote.termMonths} meses)</dt>
              <dd className="tabular-nums">S/ {formatPen(contractTotalPen)}</dd>
            </div>
          </dl>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-11 w-full border-foreground text-foreground hover:bg-foreground hover:text-background"
        >
          <Link to={contactHref}>Solicitar alquiler</Link>
        </Button>
      </div>
      ) : null}
    </section>
  );
}
