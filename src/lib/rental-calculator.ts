import type { RentalPlanOption } from '@/types/product-detail';

/** Costo por copia negro (PEN). */
export const RENTAL_BLACK_COPY_COST_PEN = 0.09;

/** Instalación y transporte (único) si el plazo es menor a 6 meses. */
export const RENTAL_SETUP_FEE_PEN = 250;

export const RENTAL_MIN_TERM_FOR_FREE_SETUP = 6;

export const RENTAL_DEFAULT_MONTHLY_PAGES = 5000;

export const RENTAL_TERM_OPTIONS = [3, 6, 12] as const;

export type RentalTermMonths = (typeof RENTAL_TERM_OPTIONS)[number];

export interface RentalCalculatorInput {
  termMonths: number;
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
  copyChargesPen: number;
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
  const termMonths = Math.max(1, Math.floor(input.termMonths));
  const plan = resolveRentalPlanForPages(monthlyPages, input.plans);
  const baseMonthlyPen = plan.monthlyPricePen;
  const includedPages = plan.pagesPerMonth;
  const extraPages = Math.max(0, monthlyPages - includedPages);
  const copyChargesPen = Math.round(monthlyPages * RENTAL_BLACK_COPY_COST_PEN * 100) / 100;
  const monthlySubtotalPen = Math.round((baseMonthlyPen + copyChargesPen) * 100) / 100;
  const setupFeePen = termMonths < RENTAL_MIN_TERM_FOR_FREE_SETUP ? RENTAL_SETUP_FEE_PEN : 0;
  const contractTotalPen =
    Math.round((monthlySubtotalPen * termMonths + setupFeePen) * 100) / 100;

  return {
    plan,
    baseMonthlyPen,
    includedPages,
    monthlyPages,
    extraPages,
    copyChargesPen,
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
