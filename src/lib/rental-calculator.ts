import type { RentalPlanOption } from '@/types/product-detail';
import { usdToPen } from '@/lib/utils';

/** Costo por copia monocromática B/N (PEN/pág. A4 equivalente). */
export const RENTAL_BW_COPY_COST_PEN = 0.0767;

/** @deprecated Usar RENTAL_BW_COPY_COST_PEN */
export const RENTAL_EXCESS_COPY_COST_PEN = RENTAL_BW_COPY_COST_PEN;

/** @deprecated Usar RENTAL_BW_COPY_COST_PEN */
export const RENTAL_BW_VARIABLE_COPY_COST_PEN = RENTAL_BW_COPY_COST_PEN;

/** @deprecated Usar RENTAL_BW_COPY_COST_PEN */
export const RENTAL_BLACK_COPY_COST_PEN = RENTAL_BW_COPY_COST_PEN;

/** Excedente negro en equipo color (PEN/pág.). */
export const RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN = 0.118;

/** @deprecated Usar RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN */
export const RENTAL_COLOR_BLACK_VARIABLE_COPY_COST_PEN = RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN;

/** Excedente color en equipo color (PEN/pág.). */
export const RENTAL_COLOR_EXCESS_COPY_COST_PEN = 0.413;

/** @deprecated Usar RENTAL_COLOR_EXCESS_COPY_COST_PEN */
export const RENTAL_COLOR_VARIABLE_COPY_COST_PEN = RENTAL_COLOR_EXCESS_COPY_COST_PEN;

/** Una página A3 equivale a 2 páginas A4 en el cómputo. */
export const RENTAL_A3_TO_A4_FACTOR = 2;

/** Proporción negro / total en planes color (p. ej. 3 000 + 2 000 = 5 000). */
export const RENTAL_COLOR_BLACK_PAGE_SHARE = 0.6;

/** Escaneo de cortesía: % del plan base sin cargo. */
export const RENTAL_SCAN_COURTESY_RATIO = 0.3;

/** Costo por página de escaneo sobre la cortesía (PEN). */
export const RENTAL_SCAN_EXCESS_COPY_COST_PEN = 0.0236;

/** Bolsa mínima de páginas para el cálculo. */
export const RENTAL_MIN_BILLABLE_PAGES = 5000;

/** Recargo por papel monocromático (PEN/pág. A4 eq.). */
export const RENTAL_PAPER_SURCHARGE_BW_PEN = 0.1;

/** Recargo por papel en equipo color — se aplica a negro y color (PEN/pág.). */
export const RENTAL_PAPER_SURCHARGE_COLOR_PEN = 0.1;

/** @deprecated Usar RENTAL_PAPER_SURCHARGE_BW_PEN */
export const RENTAL_PAPER_SURCHARGE_PEN = RENTAL_PAPER_SURCHARGE_BW_PEN;

/** Recargo por copia de cada acabado (enmicadora, guillotina, espiraladora, anilladora). */
export const RENTAL_FINISHING_COPY_SURCHARGE_PEN = 0.05;

/** Cuota fija mensual por operador (PEN). */
export const RENTAL_OPERATOR_MONTHLY_PEN = 2000;

/** Cuota fija mensual por laptop adicional en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN = 299;

/** @deprecated Los acabados pasan a recargo por copia. */
export const RENTAL_EQUIPMENT_GUILLOTINE_MONTHLY_PEN = 99;

/** @deprecated Los acabados pasan a recargo por copia. */
export const RENTAL_EQUIPMENT_LAMINATOR_MONTHLY_PEN = 199;

/** Cuota mensual por operador dedicado en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN = 2000;

/** Cuota mensual por técnico residente en alquiler de equipo (PEN). */
export const RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN = 2000;

/** @deprecated Los acabados pasan a recargo por copia. */
export const RENTAL_EQUIPMENT_SPIRAL_BINDER_MONTHLY_PEN = 349;

/** Plazo por defecto al abrir el simulador (meses). */
export const RENTAL_DEFAULT_TERM_MONTHS = 12;

/** @deprecated Usar RENTAL_DEFAULT_TERM_MONTHS o el plazo elegido en el simulador. */
export const RENTAL_TERM_MONTHS = 36;

/** Beneficio incluido en el plan de mantenimiento. */
export const RENTAL_TERM_RENEWAL_NOTE = 'Incluye Mantenimiento General Inicial.';

export const RENTAL_TERM_PRESET_OPTIONS = [6, 12, 36] as const;

/** @deprecated Usar RENTAL_TERM_PRESET_OPTIONS; el plazo también admite personalizado. */
export const RENTAL_TERM_OPTIONS = RENTAL_TERM_PRESET_OPTIONS;

export type RentalTermMonths = (typeof RENTAL_TERM_PRESET_OPTIONS)[number] | number;

/** Instalación y transporte (único) si el plazo es menor a 6 meses. */
export const RENTAL_SETUP_FEE_PEN = 250;

export const RENTAL_MIN_TERM_FOR_FREE_SETUP = 6;

export const RENTAL_DEFAULT_MONTHLY_PAGES = 5000;

/** Precio «desde» mensual mostrado en el banner del plan (PEN). */
export const MAINTENANCE_PLAN_FROM_MONTHLY_PEN = 499;

export const RENTAL_CUSTOM_PLAN_ID = 'custom';

export interface RentalCalculatorInput {
  termMonths?: number;
  monthlyPages: number;
  includesPaper: boolean;
  includesOperator: boolean;
  plans: RentalPlanOption[];
  /** Si true, páginas se interpretan como A4 eq. y el excedente usa tarifa B/N. */
  isColorEquipment?: boolean;
  blackPages?: number;
  colorPages?: number;
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

export interface EquipmentRentalExtraServices {
  paper: boolean;
  operator: boolean;
  laptop: boolean;
  laminator: boolean;
  guillotine: boolean;
  residentTech: boolean;
  spiralBinder: boolean;
  ringBinder: boolean;
}

export interface EquipmentRentalEstimate {
  billablePages: number;
  /** @deprecated Usar variableFeeMonthlyPen */
  copyCostMonthlyPen: number;
  fixedFeeMonthlyPen: number;
  variableFeeMonthlyPen: number;
  excessFeeMonthlyPen: number;
  blackVariableMonthlyPen: number;
  colorVariableMonthlyPen: number;
  planBaseMonthlyPen: number;
  scanFeeMonthlyPen: number;
  finishingSurchargeMonthlyPen: number;
  finishingPerCopyPen: number;
  isColorEquipment: boolean;
  estimatedMonthlyPen: number;
  termMonths: number;
  equipmentQuantity: number;
  monthlyPages: number;
  blackPages: number;
  colorPages: number;
  a4Pages: number;
  a3Pages: number;
  scanPages: number;
  hasExtraServices: boolean;
  laptopFeeMonthlyPen: number;
  paperSurchargeMonthlyPen: number;
  extraServicesMonthlyPen: number;
  extraServices: EquipmentRentalExtraServices;
  planId: string;
  includedPages: number;
  includedBlackPages: number;
  includedColorPages: number;
}

export function roundPen(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Desglose negro/color por defecto (60 % / 40 %), p. ej. 5 000 → 3 000 + 2 000. */
export function defaultColorPageSplit(totalPages: number): {
  blackPages: number;
  colorPages: number;
} {
  const safe = Math.max(0, Math.floor(totalPages));
  const blackPages = Math.round(safe * RENTAL_COLOR_BLACK_PAGE_SHARE);
  return { blackPages, colorPages: Math.max(0, safe - blackPages) };
}

export function toA4EquivalentPages(a4Pages: number, a3Pages: number): number {
  return Math.max(0, Math.floor(a4Pages)) + Math.max(0, Math.floor(a3Pages)) * RENTAL_A3_TO_A4_FACTOR;
}

export function resolveRentalPlanForPages(
  monthlyPages: number,
  plans: RentalPlanOption[],
): RentalPlanOption {
  const sorted = [...plans].sort((a, b) => a.pagesPerMonth - b.pagesPerMonth);
  if (sorted.length === 0) {
    return {
      pagesPerMonth: RENTAL_DEFAULT_MONTHLY_PAGES,
      monthlyPricePen: MAINTENANCE_PLAN_FROM_MONTHLY_PEN,
    };
  }
  const safePages = Math.max(1, Math.floor(monthlyPages));
  const matching = sorted.find((plan) => plan.pagesPerMonth >= safePages);
  return matching ?? sorted[sorted.length - 1]!;
}

export function calculateRentalQuote(input: RentalCalculatorInput): RentalCalculatorBreakdown {
  const termMonths = Math.max(1, Math.floor(input.termMonths ?? RENTAL_DEFAULT_TERM_MONTHS));
  const isColor = input.isColorEquipment === true;

  let monthlyPages: number;
  let excessChargesPen: number;

  if (isColor) {
    const blackPages = Math.max(0, Math.floor(input.blackPages ?? 0));
    const colorPages = Math.max(0, Math.floor(input.colorPages ?? 0));
    monthlyPages = Math.max(1, blackPages + colorPages);
    const plan = resolveRentalPlanForPages(monthlyPages, input.plans);
    const split = defaultColorPageSplit(plan.pagesPerMonth);
    const excessBlack = Math.max(0, blackPages - split.blackPages);
    const excessColor = Math.max(0, colorPages - split.colorPages);
    excessChargesPen = roundPen(
      excessBlack * RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN +
        excessColor * RENTAL_COLOR_EXCESS_COPY_COST_PEN,
    );
    const paperChargesPen = input.includesPaper
      ? roundPen(monthlyPages * RENTAL_PAPER_SURCHARGE_COLOR_PEN)
      : 0;
    const operatorChargesPen = input.includesOperator ? RENTAL_OPERATOR_MONTHLY_PEN : 0;
    const monthlySubtotalPen = roundPen(
      plan.monthlyPricePen + excessChargesPen + paperChargesPen + operatorChargesPen,
    );
    const setupFeePen = termMonths < RENTAL_MIN_TERM_FOR_FREE_SETUP ? RENTAL_SETUP_FEE_PEN : 0;
    return {
      plan,
      baseMonthlyPen: plan.monthlyPricePen,
      includedPages: plan.pagesPerMonth,
      monthlyPages,
      extraPages: excessBlack + excessColor,
      excessChargesPen,
      paperChargesPen,
      operatorChargesPen,
      monthlySubtotalPen,
      setupFeePen,
      contractTotalPen: roundPen(monthlySubtotalPen * termMonths + setupFeePen),
      includesPaper: input.includesPaper,
      includesOperator: input.includesOperator,
      termMonths,
    };
  }

  monthlyPages = Math.max(1, Math.floor(input.monthlyPages));
  const plan = resolveRentalPlanForPages(monthlyPages, input.plans);
  const baseMonthlyPen = plan.monthlyPricePen;
  const includedPages = plan.pagesPerMonth;
  const extraPages = Math.max(0, monthlyPages - includedPages);
  excessChargesPen = roundPen(extraPages * RENTAL_BW_COPY_COST_PEN);
  const paperChargesPen = input.includesPaper
    ? roundPen(monthlyPages * RENTAL_PAPER_SURCHARGE_BW_PEN)
    : 0;
  const operatorChargesPen = input.includesOperator ? RENTAL_OPERATOR_MONTHLY_PEN : 0;
  const monthlySubtotalPen = roundPen(
    baseMonthlyPen + excessChargesPen + paperChargesPen + operatorChargesPen,
  );
  const setupFeePen = termMonths < RENTAL_MIN_TERM_FOR_FREE_SETUP ? RENTAL_SETUP_FEE_PEN : 0;

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
    contractTotalPen: roundPen(monthlySubtotalPen * termMonths + setupFeePen),
    includesPaper: input.includesPaper,
    includesOperator: input.includesOperator,
    termMonths,
  };
}

export interface ComputeEquipmentRentalEstimateInput {
  planId?: string;
  planMonthlyPricePen?: number;
  includedPages?: number;
  monthlyPages?: number;
  blackPages?: number;
  colorPages?: number;
  a4Pages?: number;
  a3Pages?: number;
  scanPages?: number;
  equipmentQuantity: number;
  termMonths: number;
  equipmentBasePriceUsd: number;
  isColorEquipment?: boolean;
  includePaper?: boolean;
  includeOperator?: boolean;
  includeLaptop?: boolean;
  includeLaminator?: boolean;
  includeGuillotine?: boolean;
  includeResidentTech?: boolean;
  includeSpiralBinder?: boolean;
  includeRingBinder?: boolean;
}

export function computeEquipmentRentalEstimate(
  input: ComputeEquipmentRentalEstimateInput,
): EquipmentRentalEstimate {
  const quantity = Math.max(1, Math.floor(input.equipmentQuantity));
  const termMonths = Math.max(1, Math.floor(input.termMonths || RENTAL_DEFAULT_TERM_MONTHS));
  const isColorEquipment = input.isColorEquipment === true;

  const includePaper = input.includePaper === true;
  const includeOperator = input.includeOperator === true;
  const includeLaptop = input.includeLaptop === true;
  const includeLaminator = input.includeLaminator === true;
  const includeGuillotine = input.includeGuillotine === true;
  const includeResidentTech = input.includeResidentTech === true;
  const includeSpiralBinder = input.includeSpiralBinder === true;
  const includeRingBinder = input.includeRingBinder === true;

  const finishingCount =
    Number(includeLaminator) +
    Number(includeGuillotine) +
    Number(includeSpiralBinder) +
    Number(includeRingBinder);
  const finishingPerCopyPen = finishingCount * RENTAL_FINISHING_COPY_SURCHARGE_PEN;

  let blackPages = 0;
  let colorPages = 0;
  let a4Pages = 0;
  let a3Pages = 0;
  let billablePages = 0;

  if (isColorEquipment) {
    blackPages = Math.max(0, Math.floor(input.blackPages ?? 0));
    colorPages = Math.max(0, Math.floor(input.colorPages ?? 0));
    if (blackPages === 0 && colorPages === 0 && input.monthlyPages != null) {
      const split = defaultColorPageSplit(input.monthlyPages);
      blackPages = split.blackPages;
      colorPages = split.colorPages;
    }
    billablePages = Math.max(1, blackPages + colorPages);
  } else {
    a4Pages = Math.max(0, Math.floor(input.a4Pages ?? input.monthlyPages ?? RENTAL_DEFAULT_MONTHLY_PAGES));
    a3Pages = Math.max(0, Math.floor(input.a3Pages ?? 0));
    if (input.a4Pages == null && input.a3Pages == null && input.monthlyPages != null) {
      a4Pages = Math.max(0, Math.floor(input.monthlyPages));
      a3Pages = 0;
    }
    billablePages = Math.max(1, toA4EquivalentPages(a4Pages, a3Pages));
  }

  const includedPages = Math.max(
    0,
    Math.floor(input.includedPages ?? input.monthlyPages ?? RENTAL_DEFAULT_MONTHLY_PAGES),
  );
  const planBaseMonthlyPen = roundPen((input.planMonthlyPricePen ?? 0) * quantity);
  const planId = input.planId ?? RENTAL_CUSTOM_PLAN_ID;

  const includedSplit = defaultColorPageSplit(includedPages);
  const includedBlackPages = isColorEquipment ? includedSplit.blackPages : includedPages;
  const includedColorPages = isColorEquipment ? includedSplit.colorPages : 0;

  let excessBlack = 0;
  let excessColor = 0;
  let excessBw = 0;
  let blackVariableMonthlyPen = 0;
  let colorVariableMonthlyPen = 0;

  if (isColorEquipment) {
    excessBlack = Math.max(0, blackPages - includedBlackPages);
    excessColor = Math.max(0, colorPages - includedColorPages);
    blackVariableMonthlyPen = roundPen(
      excessBlack * RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN * quantity,
    );
    colorVariableMonthlyPen = roundPen(
      excessColor * RENTAL_COLOR_EXCESS_COPY_COST_PEN * quantity,
    );
  } else {
    excessBw = Math.max(0, billablePages - includedPages);
    blackVariableMonthlyPen = roundPen(excessBw * RENTAL_BW_COPY_COST_PEN * quantity);
  }

  const excessFeeMonthlyPen = roundPen(blackVariableMonthlyPen + colorVariableMonthlyPen);

  const paperRate = isColorEquipment
    ? RENTAL_PAPER_SURCHARGE_COLOR_PEN
    : RENTAL_PAPER_SURCHARGE_BW_PEN;
  const paperSurchargeMonthlyPen = includePaper
    ? roundPen(billablePages * paperRate * quantity)
    : 0;

  const scanPages = Math.max(0, Math.floor(input.scanPages ?? 0));
  const scanCourtesyPages = Math.floor(includedPages * RENTAL_SCAN_COURTESY_RATIO);
  const scanExcessPages = Math.max(0, scanPages - scanCourtesyPages);
  const scanFeeMonthlyPen = roundPen(scanExcessPages * RENTAL_SCAN_EXCESS_COPY_COST_PEN * quantity);

  /** Acabados: +S/ 0.05 c/u sobre cada página facturable (recargo del costo por copia). */
  const finishingSurchargeMonthlyPen = roundPen(billablePages * finishingPerCopyPen * quantity);

  const productValuePen = usdToPen(input.equipmentBasePriceUsd);
  const equipmentFixedFeeMonthlyPen = roundPen(((productValuePen * 1.2) / termMonths) * quantity);
  const laptopFeeMonthlyPen = includeLaptop ? RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN : 0;
  const fixedFeeMonthlyPen = roundPen(equipmentFixedFeeMonthlyPen + laptopFeeMonthlyPen);

  let staffMonthlyPen = 0;
  if (includeOperator) staffMonthlyPen += RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN;
  if (includeResidentTech) staffMonthlyPen += RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN;
  const extraServicesMonthlyPen = roundPen(staffMonthlyPen);

  const variableFeeMonthlyPen = roundPen(
    planBaseMonthlyPen +
      excessFeeMonthlyPen +
      paperSurchargeMonthlyPen +
      scanFeeMonthlyPen +
      finishingSurchargeMonthlyPen,
  );

  const estimatedMonthlyPen = roundPen(
    fixedFeeMonthlyPen + variableFeeMonthlyPen + extraServicesMonthlyPen,
  );

  return {
    billablePages,
    copyCostMonthlyPen: variableFeeMonthlyPen,
    fixedFeeMonthlyPen,
    variableFeeMonthlyPen,
    excessFeeMonthlyPen,
    blackVariableMonthlyPen,
    colorVariableMonthlyPen,
    planBaseMonthlyPen,
    scanFeeMonthlyPen,
    finishingSurchargeMonthlyPen,
    finishingPerCopyPen,
    isColorEquipment,
    estimatedMonthlyPen,
    termMonths,
    equipmentQuantity: quantity,
    monthlyPages: billablePages,
    blackPages,
    colorPages,
    a4Pages,
    a3Pages,
    scanPages,
    laptopFeeMonthlyPen,
    paperSurchargeMonthlyPen,
    extraServicesMonthlyPen,
    hasExtraServices:
      includePaper ||
      includeOperator ||
      includeLaptop ||
      includeLaminator ||
      includeGuillotine ||
      includeResidentTech ||
      includeSpiralBinder ||
      includeRingBinder,
    extraServices: {
      paper: includePaper,
      operator: includeOperator,
      laptop: includeLaptop,
      laminator: includeLaminator,
      guillotine: includeGuillotine,
      residentTech: includeResidentTech,
      spiralBinder: includeSpiralBinder,
      ringBinder: includeRingBinder,
    },
    planId,
    includedPages,
    includedBlackPages,
    includedColorPages,
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
