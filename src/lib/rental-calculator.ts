import type { RentalPlanOption } from '@/types/product-detail';

/** Costo por copia negro sobre la cuota base del plan (PEN). */
export const RENTAL_EXCESS_COPY_COST_PEN = 0.09;

/** Cuota variable mensual — negro en equipos monocromáticos (PEN/pág.). */
export const RENTAL_BW_VARIABLE_COPY_COST_PEN = 0.09;

/** Cuota variable mensual — negro en equipos a color (PEN/pág.). */
export const RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN = 0.15;

/** Cuota variable mensual — color en equipos a color (PEN/pág.). */
export const RENTAL_COLOR_VARIABLE_COPY_COST_PEN = 0.25;

/** Bolsa mínima de páginas para el cálculo de cuota variable. */
export const RENTAL_MIN_BILLABLE_PAGES = 5000;

/** @deprecated Usar RENTAL_EXCESS_COPY_COST_PEN */
export const RENTAL_BLACK_COPY_COST_PEN = RENTAL_EXCESS_COPY_COST_PEN;

/** Recargo por página cuando se incluye papel (PEN). */
export const RENTAL_PAPER_SURCHARGE_PEN = 0.02;

/** Cuota fija mensual por operador (PEN). */
export const RENTAL_OPERATOR_MONTHLY_PEN = 2000;

/** Cuota fija mensual por laptop adicional en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN = 299;

/** Cuota mensual por guillotina en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_GUILLOTINE_MONTHLY_PEN = 99;

/** Cuota mensual por enmicadora en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_LAMINATOR_MONTHLY_PEN = 199;

/** Cuota mensual por operador dedicado en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN = 2000;

/** Cuota mensual por técnico residente en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN = 2000;

/** Cuota mensual por espiraladora/anilladora en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_SPIRAL_BINDER_MONTHLY_PEN = 349;

/** Plazo fijo de contrato de alquiler (meses) — valor por defecto al abrir el simulador. */
export const RENTAL_DEFAULT_TERM_MONTHS = 6;

/** @deprecated Usar RENTAL_DEFAULT_TERM_MONTHS o el plazo elegido en el simulador. */
export const RENTAL_TERM_MONTHS = 36;

/** Beneficio incluido en el plan de mantenimiento. */
export const RENTAL_TERM_RENEWAL_NOTE =
  'Incluye Mantenimiento Preventivo Inicial y Final.';

export const RENTAL_TERM_OPTIONS = [6, 12, 36] as const;

export type RentalTermMonths = (typeof RENTAL_TERM_OPTIONS)[number];

/** Instalación y transporte (único) si el plazo es menor a 6 meses. */
export const RENTAL_SETUP_FEE_PEN = 250;

export const RENTAL_MIN_TERM_FOR_FREE_SETUP = 6;

export const RENTAL_DEFAULT_MONTHLY_PAGES = 5000;

/** Precio «desde» mensual mostrado en el banner del plan (PEN). */
export const MAINTENANCE_PLAN_FROM_MONTHLY_PEN = 150;

export interface RentalCalculatorInput {
  termMonths?: number;
  monthlyPages: number;
  includesPaper: boolean;
  includesOperator: boolean;
  plans: RentalPlanOption[];
}

export interface RentalCalculatorBreakdown {
  plan: RentalPlanOption;
  baseMonthlyPen: number;
  includedPages: number;
  monthlyPages: number;
  extraPages: number;
  excessChargesPen: number;
  paperChargesPen: number;
  operatorChargesPen: number;
  monthlySubtotalPen: number;
  setupFeePen: number;
  contractTotalPen: number;
  includesPaper: boolean;
  includesOperator: boolean;
  termMonths: number;
}

export function resolveRentalPlanForPages(
  monthlyPages: number,
  plans: RentalPlanOption[],
): RentalPlanOption {
  const sorted = [...plans].sort((a, b) => a.pagesPerMonth - b.pagesPerMonth);
  const safePages = Math.max(1, Math.floor(monthlyPages));

  const matching = sorted.find((plan) => plan.pagesPerMonth >= safePages);
  return matching ?? sorted[sorted.length - 1]!;
}

export function calculateRentalQuote(input: RentalCalculatorInput): RentalCalculatorBreakdown {
  const monthlyPages = Math.max(1, Math.floor(input.monthlyPages));
  const termMonths = Math.max(1, Math.floor(input.termMonths ?? RENTAL_DEFAULT_TERM_MONTHS));
  const plan = resolveRentalPlanForPages(monthlyPages, input.plans);
  const baseMonthlyPen = plan.monthlyPricePen;
  const includedPages = plan.pagesPerMonth;
  const extraPages = Math.max(0, monthlyPages - includedPages);
  const excessChargesPen =
    Math.round(extraPages * RENTAL_EXCESS_COPY_COST_PEN * 100) / 100;
  const paperChargesPen = input.includesPaper
    ? Math.round(monthlyPages * RENTAL_PAPER_SURCHARGE_PEN * 100) / 100
    : 0;
  const operatorChargesPen = input.includesOperator ? RENTAL_OPERATOR_MONTHLY_PEN : 0;
  const monthlySubtotalPen =
    Math.round(
      (baseMonthlyPen + excessChargesPen + paperChargesPen + operatorChargesPen) * 100,
    ) / 100;
  const setupFeePen = termMonths < RENTAL_MIN_TERM_FOR_FREE_SETUP ? RENTAL_SETUP_FEE_PEN : 0;
  const contractTotalPen =
    Math.round((monthlySubtotalPen * termMonths + setupFeePen) * 100) / 100;

  return {
    plan,
    baseMonthlyPen,
    includedPages,
    monthlyPages,
    extraPages,
    excessChargesPen,
    paperChargesPen,
    operatorChargesPen,
    monthlySubtotalPen,
    setupFeePen,
    contractTotalPen,
    includesPaper: input.includesPaper,
    includesOperator: input.includesOperator,
    termMonths,
  };
}

export function formatPen(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formato PEN para cotizaciones de alquiler (sin redondeo comercial al 9). */
export function formatEquipmentRentalPen(value: number): string {
  return value.toLocaleString('es-PE', { maximumFractionDigits: 2 });
}
