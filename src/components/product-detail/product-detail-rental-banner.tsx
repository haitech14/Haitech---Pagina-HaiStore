import { useMemo, useState } from 'react';
import { Calculator, ChevronDown, FileText, Wrench } from 'lucide-react';

import { ProductRentalQuoteDialog } from '@/components/product-detail/product-rental-quote-dialog';
import {
  ProductQuotePdfViewer,
  type QuotePdfPreview,
} from '@/components/product-detail/product-quote-pdf-viewer';
import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MAINTENANCE_PLAN_FROM_MONTHLY_PEN,
  RENTAL_BW_COPY_COST_PEN,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_DEFAULT_TERM_MONTHS,
  RENTAL_TERM_PRESET_OPTIONS,
  RENTAL_TERM_RENEWAL_NOTE,
  calculateRentalQuote,
  formatPen,
} from '@/lib/rental-calculator';
import { cn, penToUsd } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailRentalBannerProps {
  product: Product;
  plans: RentalPlanOption[];
  displayTitle: string;
  sku: string;
  brandLabel: string;
  className?: string;
}

function BreakdownLine({
  label,
  amountPen,
}: {
  label: string;
  amountPen: number;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="shrink-0 font-semibold tabular-nums text-foreground">
        <DualPrice usd={penToUsd(amountPen)} />
      </dd>
    </div>
  );
}

export function ProductDetailRentalBanner({
  product,
  plans,
  displayTitle,
  sku,
  brandLabel,
  className,
}: ProductDetailRentalBannerProps) {
  const [open, setOpen] = useState(false);
  const [termIsCustom, setTermIsCustom] = useState(false);
  const [termMonths, setTermMonths] = useState<number>(RENTAL_DEFAULT_TERM_MONTHS);
  const [customTermMonths, setCustomTermMonths] = useState(18);
  const [monthlyPages, setMonthlyPages] = useState(RENTAL_DEFAULT_MONTHLY_PAGES);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePdfPreview, setQuotePdfPreview] = useState<QuotePdfPreview | null>(null);

  const effectiveTermMonths = termIsCustom
    ? Math.max(1, Math.floor(customTermMonths) || 1)
    : termMonths;

  const quote = useMemo(
    () =>
      calculateRentalQuote({
        monthlyPages,
        includesPaper: false,
        includesOperator: false,
        plans,
        termMonths: effectiveTermMonths,
      }),
    [monthlyPages, plans, effectiveTermMonths],
  );

  const panelId = 'maintenance-plan-simulator-panel';

  if (plans.length === 0) return null;

  const handleQuotePdfPreviewClose = (isOpen: boolean) => {
    if (isOpen) return;
    if (quotePdfPreview?.url) {
      URL.revokeObjectURL(quotePdfPreview.url);
    }
    setQuotePdfPreview(null);
  };

  return (
    <>
      <section
        aria-labelledby="maintenance-plan-banner-title"
        className={cn(
          'overflow-hidden rounded-xl border border-sky-200 bg-sky-50',
          className,
        )}
      >
        <button
          type="button"
          className="flex w-full items-start gap-3 border-b border-sky-200/80 bg-sky-50 px-4 py-3 text-left transition-colors hover:bg-sky-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-300/80 bg-white text-sky-800"
            aria-hidden="true"
          >
            <Wrench className="size-5" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span
              id="maintenance-plan-banner-title"
              className="block text-balance text-sm font-bold leading-snug text-foreground sm:text-base"
            >
              Plan de Mantenimiento y Suministros
            </span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-bold text-sky-900 sm:text-base">
                Desde S/ {formatPen(MAINTENANCE_PLAN_FROM_MONTHLY_PEN)}/mes
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                · {RENTAL_DEFAULT_TERM_MONTHS} meses
              </span>
            </span>
            <span className="mt-1 block text-pretty text-xs leading-snug text-muted-foreground sm:text-sm">
              {open
                ? 'Indica tu producción mensual y simula el costo del plan.'
                : 'Mantenimiento preventivo, repuestos y suministros. Plazos 6, 12 o 36 meses.'}
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
            <div
              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground sm:text-sm"
              role="note"
            >
              <p className="font-medium">{RENTAL_TERM_RENEWAL_NOTE}</p>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Plazo del plan
              </legend>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Plazo del plan en meses"
              >
                {RENTAL_TERM_PRESET_OPTIONS.map((months) => {
                  const selected = !termIsCustom && termMonths === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={cn(
                        'min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-muted/50',
                      )}
                      onClick={() => {
                        setTermIsCustom(false);
                        setTermMonths(months);
                      }}
                    >
                      {months} meses
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="radio"
                  aria-checked={termIsCustom}
                  className={cn(
                    'min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    termIsCustom
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted/50',
                  )}
                  onClick={() => setTermIsCustom(true)}
                >
                  Personalizado
                </button>
              </div>
              {termIsCustom ? (
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={customTermMonths}
                  onChange={(event) =>
                    setCustomTermMonths(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="mt-2 h-11 max-w-[12rem] tabular-nums"
                  aria-label="Plazo personalizado en meses"
                />
              ) : null}
            </fieldset>

            <div className="space-y-2">
              <Label
                htmlFor="maintenance-monthly-pages"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Producción mensual
              </Label>
              <Input
                id="maintenance-monthly-pages"
                type="number"
                min={1}
                step={500}
                value={monthlyPages}
                onChange={(event) =>
                  setMonthlyPages(Math.max(1, Number(event.target.value) || 1))
                }
                className="h-11 tabular-nums"
                aria-describedby="maintenance-monthly-pages-hint"
              />
              <p id="maintenance-monthly-pages-hint" className="text-xs text-muted-foreground">
                Base: {quote.includedPages.toLocaleString('es-PE')} pág./mes · ejemplo{' '}
                {RENTAL_DEFAULT_MONTHLY_PAGES.toLocaleString('es-PE')} pág./mes
              </p>
            </div>

            <div
              className="rounded-lg border border-border/60 bg-muted/20 p-4"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calculator className="size-4 shrink-0" aria-hidden="true" />
                Estimación mensual · plazo {effectiveTermMonths} meses
              </div>

              <dl className="space-y-2 text-sm">
                <BreakdownLine label="Cuota fija mensual" amountPen={quote.baseMonthlyPen} />

                <BreakdownLine
                  label={
                    quote.excessChargesPen > 0
                      ? `Cuota variable mensual (${quote.extraPages.toLocaleString('es-PE')} × S/ ${RENTAL_BW_COPY_COST_PEN})`
                      : 'Cuota variable mensual'
                  }
                  amountPen={quote.excessChargesPen}
                />

                <div className="border-t border-border/60 pt-2">
                  <div className="flex items-center justify-between gap-3 font-bold text-foreground">
                    <dt>Total mensual estimado</dt>
                    <dd className="tabular-nums">
                      <DualPrice usd={penToUsd(quote.monthlySubtotalPen)} className="inline font-bold" />
                    </dd>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-base font-bold text-foreground">
                  <dt>Total plan ({quote.termMonths} meses)</dt>
                  <dd className="tabular-nums">
                    <DualPrice usd={penToUsd(quote.contractTotalPen)} className="inline font-bold" />
                  </dd>
                </div>
              </dl>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full gap-2 border-foreground text-foreground hover:bg-foreground hover:text-background"
              onClick={() => setQuoteOpen(true)}
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              Generar cotización del plan
            </Button>
          </div>
        ) : null}
      </section>

      <ProductRentalQuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        product={product}
        displayTitle={displayTitle}
        sku={sku}
        brandLabel={brandLabel}
        breakdown={quote}
        onGenerated={setQuotePdfPreview}
      />

      <ProductQuotePdfViewer preview={quotePdfPreview} onOpenChange={handleQuotePdfPreviewClose} autoDownload />
    </>
  );
}
