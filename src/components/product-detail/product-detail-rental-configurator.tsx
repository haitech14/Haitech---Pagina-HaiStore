import { useEffect, useMemo, useState } from 'react';

import {
  RENTAL_BW_VARIABLE_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN,
  RENTAL_COLOR_VARIABLE_COPY_COST_PEN,
  RENTAL_DEFAULT_MONTHLY_PAGES,
  RENTAL_EXCESS_COPY_COST_PEN,
} from '@/lib/rental-calculator';
import { cn, usdToPen } from '@/lib/utils';
import type { RentalPlanOption } from '@/types/product-detail';

export interface EquipmentRentalEstimate {
  billablePages: number;
  /** @deprecated Usar variableFeeMonthlyPen */
  copyCostMonthlyPen: number;
  fixedFeeMonthlyPen: number;
  variableFeeMonthlyPen: number;
  excessFeeMonthlyPen: number;
  blackVariableMonthlyPen: number;
  colorVariableMonthlyPen: number;
  isColorEquipment: boolean;
  estimatedMonthlyPen: number;
  termMonths: 6 | 12 | 36;
  equipmentQuantity: number;
  monthlyPages: number;
  hasExtraServices: boolean;
}

interface ProductDetailRentalConfiguratorProps {
  rentalPlans: RentalPlanOption[];
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  onEstimateChange?: (estimate: EquipmentRentalEstimate) => void;
  className?: string;
  hideTitle?: boolean;
}

export function computeEquipmentRentalEstimate(input: {
  monthlyPages: number;
  equipmentQuantity: number;
  termMonths: 6 | 12 | 36;
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  includePaper: boolean;
  includeOperator: boolean;
  includeLaptop: boolean;
  includeLaminator: boolean;
  includeGuillotine: boolean;
}): EquipmentRentalEstimate {
  const pages = Math.max(1, Math.floor(input.monthlyPages || RENTAL_DEFAULT_MONTHLY_PAGES));
  const quantity = Math.max(1, input.equipmentQuantity);
  const isColorEquipment = input.isColorEquipment === true;
  const quotaBase = RENTAL_DEFAULT_MONTHLY_PAGES;
  const basePages = Math.min(pages, quotaBase);
  const excessPages = Math.max(0, pages - quotaBase);

  const productValuePen = usdToPen(input.equipmentBasePriceUsd);
  const fixedFeeMonthlyPen =
    Math.round(((productValuePen * 1.2) / input.termMonths) * quantity * 100) / 100;

  let blackVariableMonthlyPen = 0;
  let colorVariableMonthlyPen = 0;
  let excessFeeMonthlyPen = 0;

  if (isColorEquipment) {
    const blackBase = basePages * RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN;
    const blackExcess = excessPages * RENTAL_EXCESS_COPY_COST_PEN;
    const colorBase = basePages * RENTAL_COLOR_VARIABLE_COPY_COST_PEN;
    const colorExcess = excessPages * RENTAL_COLOR_VARIABLE_COPY_COST_PEN;
    blackVariableMonthlyPen =
      Math.round((blackBase + blackExcess) * quantity * 100) / 100;
    colorVariableMonthlyPen =
      Math.round((colorBase + colorExcess) * quantity * 100) / 100;
    excessFeeMonthlyPen =
      Math.round((blackExcess + colorExcess) * quantity * 100) / 100;
  } else {
    const baseVariable = basePages * RENTAL_BW_VARIABLE_COPY_COST_PEN;
    const excessVariable = excessPages * RENTAL_EXCESS_COPY_COST_PEN;
    blackVariableMonthlyPen =
      Math.round((baseVariable + excessVariable) * quantity * 100) / 100;
    excessFeeMonthlyPen = Math.round(excessVariable * quantity * 100) / 100;
  }

  const variableFeeMonthlyPen =
    Math.round((blackVariableMonthlyPen + colorVariableMonthlyPen) * 100) / 100;
  const estimatedMonthlyPen =
    Math.round((fixedFeeMonthlyPen + variableFeeMonthlyPen) * 100) / 100;

  return {
    billablePages: pages,
    copyCostMonthlyPen: variableFeeMonthlyPen,
    fixedFeeMonthlyPen,
    variableFeeMonthlyPen,
    excessFeeMonthlyPen,
    blackVariableMonthlyPen,
    colorVariableMonthlyPen,
    isColorEquipment,
    estimatedMonthlyPen,
    termMonths: input.termMonths,
    equipmentQuantity: quantity,
    monthlyPages: pages,
    hasExtraServices:
      input.includePaper ||
      input.includeOperator ||
      input.includeLaptop ||
      input.includeLaminator ||
      input.includeGuillotine,
  };
}

export function ProductDetailRentalConfigurator({
  rentalPlans,
  equipmentBasePriceUsd,
  isColorEquipment = false,
  onEstimateChange,
  className,
  hideTitle = false,
}: ProductDetailRentalConfiguratorProps) {
  const [includeLaminator, setIncludeLaminator] = useState(false);
  const [includeGuillotine, setIncludeGuillotine] = useState(false);
  const [monthlyPages, setMonthlyPages] = useState(() => rentalPlans[0]?.pagesPerMonth ?? 5000);
  const [equipmentQuantity, setEquipmentQuantity] = useState(1);
  const [termMonths, setTermMonths] = useState<6 | 12 | 36>(12);
  const [includePaper, setIncludePaper] = useState(false);
  const [includeOperator, setIncludeOperator] = useState(false);
  const [includeLaptop, setIncludeLaptop] = useState(false);

  const rentalPageSuggestions = useMemo(
    () =>
      Array.from(
        new Set([RENTAL_DEFAULT_MONTHLY_PAGES, ...rentalPlans.map((plan) => plan.pagesPerMonth)]),
      )
        .filter((pages) => pages > 0)
        .sort((a, b) => a - b),
    [rentalPlans],
  );

  const estimate = useMemo(
    () =>
      computeEquipmentRentalEstimate({
        monthlyPages,
        equipmentQuantity,
        termMonths,
        equipmentBasePriceUsd,
        isColorEquipment,
        includePaper,
        includeOperator,
        includeLaptop,
        includeLaminator,
        includeGuillotine,
      }),
    [
      monthlyPages,
      equipmentQuantity,
      termMonths,
      equipmentBasePriceUsd,
      isColorEquipment,
      includePaper,
      includeOperator,
      includeLaptop,
      includeLaminator,
      includeGuillotine,
    ],
  );

  useEffect(() => {
    onEstimateChange?.(estimate);
  }, [estimate, onEstimateChange]);

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3 text-left sm:p-4',
        className,
      )}
    >
      {hideTitle ? null : (
        <h3 className="text-sm font-bold text-foreground">Configura tu equipo</h3>
      )}

      <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', hideTitle ? '' : 'mt-0')}>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-foreground">Cantidad de impresiones / mes</span>
          <input
            type="number"
            min={1}
            step={500}
            value={monthlyPages}
            onChange={(event) =>
              setMonthlyPages(Math.max(1, Number(event.target.value) || RENTAL_DEFAULT_MONTHLY_PAGES))
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          />
          {rentalPageSuggestions.length > 0 ? (
            <span className="block text-[0.6875rem] text-muted-foreground">
              Sugerencias:{' '}
              {rentalPageSuggestions.map((pages) => pages.toLocaleString('es-PE')).join(' · ')}
            </span>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-foreground">Cantidad de equipos</span>
          <input
            type="number"
            min={1}
            step={1}
            value={equipmentQuantity}
            onChange={(event) => setEquipmentQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          />
        </label>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-foreground">Plazo del contrato</legend>
        <div className="grid grid-cols-3 gap-2">
          {[6, 12, 36].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTermMonths(months as 6 | 12 | 36)}
              className={cn(
                'h-9 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                termMonths === months
                  ? 'border-red-600 bg-red-50 text-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted/30',
              )}
              aria-pressed={termMonths === months}
            >
              {months} meses
            </button>
          ))}
        </div>
        {termMonths === 36 ? (
          <p className="text-[0.6875rem] font-medium text-red-600">
            Plan de 36 meses con renovación automática.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-semibold text-foreground">Servicios adicionales</legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includePaper}
              onChange={(event) => setIncludePaper(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Suministro de papel
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeOperator}
              onChange={(event) => setIncludeOperator(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Operador dedicado
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeLaptop}
              onChange={(event) => setIncludeLaptop(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Laptop
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={includeLaminator}
              onChange={(event) => setIncludeLaminator(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Enmicadora
          </label>
          <label className="flex items-center gap-2 text-xs text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={includeGuillotine}
              onChange={(event) => setIncludeGuillotine(event.target.checked)}
              className="size-4 rounded border-border text-red-600 focus:ring-red-600"
            />
            Guillotina
          </label>
        </div>
      </fieldset>

      <div className="rounded-md border border-border/70 bg-background px-3 py-2 text-xs text-foreground">
        {isColorEquipment ? (
          <p>
            Cuota variable mensual: negro{' '}
            <span className="font-semibold">S/ {RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN}</span>
            {' + '}color{' '}
            <span className="font-semibold">S/ {RENTAL_COLOR_VARIABLE_COPY_COST_PEN}</span>
            {' × '}
            <span className="font-semibold">
              {Math.min(estimate.billablePages, RENTAL_DEFAULT_MONTHLY_PAGES).toLocaleString('es-PE')}
            </span>{' '}
            páginas
            {estimate.excessFeeMonthlyPen > 0 ? (
              <>
                {' + '}excedentes{' '}
                <span className="font-semibold">
                  S/{' '}
                  {estimate.excessFeeMonthlyPen.toLocaleString('es-PE', {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </>
            ) : null}
            .
          </p>
        ) : (
          <p>
            Cuota variable mensual:{' '}
            <span className="font-semibold">S/ {RENTAL_BW_VARIABLE_COPY_COST_PEN}</span>
            {' × '}
            <span className="font-semibold">{estimate.billablePages.toLocaleString('es-PE')}</span>{' '}
            impresiones
            {estimate.excessFeeMonthlyPen > 0 ? (
              <>
                {' '}
                (incluye excedentes{' '}
                <span className="font-semibold">
                  S/{' '}
                  {estimate.excessFeeMonthlyPen.toLocaleString('es-PE', {
                    maximumFractionDigits: 2,
                  })}
                </span>
                )
              </>
            ) : null}
            .
          </p>
        )}
        <p className="mt-1">
          Cuota fija mensual:{' '}
          <span className="font-semibold">valor del equipo + 20% (×1,2)</span> ÷{' '}
          <span className="font-semibold">{estimate.termMonths} meses</span> ={' '}
          <span className="font-semibold">
            S/{' '}
            {estimate.fixedFeeMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
          </span>
          .
        </p>
        <p className="mt-1.5 font-semibold text-foreground">
          Total mensual: S/{' '}
          {estimate.estimatedMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
        </p>
        <p className="text-[0.6875rem] text-muted-foreground">
          Cuota variable S/{' '}
          {estimate.variableFeeMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
          {' + '}cuota fija S/{' '}
          {estimate.fixedFeeMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
          {estimate.isColorEquipment ? (
            <>
              {' '}
              (negro S/{' '}
              {estimate.blackVariableMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
              {' + '}color S/{' '}
              {estimate.colorVariableMonthlyPen.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
              )
            </>
          ) : null}
          .
        </p>
        {estimate.hasExtraServices ? (
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">
            Extras seleccionados:{' '}
            {[
              includePaper ? 'Papel' : null,
              includeOperator ? 'Operador' : null,
              includeLaptop ? 'Laptop' : null,
              includeLaminator ? 'Enmicadora' : null,
              includeGuillotine ? 'Guillotina' : null,
            ]
              .filter(Boolean)
              .join(', ')}{' '}
            (cotización personalizada).
          </p>
        ) : null}
      </div>
    </div>
  );
}
