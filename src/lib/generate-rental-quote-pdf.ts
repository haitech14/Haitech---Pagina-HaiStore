import type { EquipmentRentalEstimate } from '@/lib/rental-calculator';
import type { CompanySettings } from '@/types/company-settings';

import {
  RENTAL_BW_COPY_COST_PEN,
  RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN,
  RENTAL_COLOR_EXCESS_COPY_COST_PEN,
  RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN,
  RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN,
  RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN,
  RENTAL_FINISHING_COPY_SURCHARGE_PEN,
  RENTAL_OPERATOR_MONTHLY_PEN,
  RENTAL_PAPER_SURCHARGE_BW_PEN,
  RENTAL_PAPER_SURCHARGE_COLOR_PEN,
  RENTAL_SCAN_EXCESS_COPY_COST_PEN,
  RENTAL_TERM_RENEWAL_NOTE,
  formatPen,
  type RentalCalculatorBreakdown,
} from '@/lib/rental-calculator';
import {
  buildProductQuotePdf,
  type GeneratedQuotePdf,
  type QuoteClientData,
  type QuoteProductData,
} from '@/lib/generate-product-quote-pdf';

export interface RentalQuoteProduct {
  name: string;
  sku: string;
  brand: string;
  imageUrl?: string | null;
}

const EQUIPMENT_RENTAL_EXTRA_LABELS: Record<keyof EquipmentRentalEstimate['extraServices'], string> =
  {
    paper: 'Suministro de papel',
    operator: 'Operador dedicado',
    laptop: 'Laptop',
    laminator: 'Enmicadora',
    guillotine: 'Guillotina',
    residentTech: 'Técnico residente',
    spiralBinder: 'Espiraladora',
    ringBinder: 'Anilladora',
  };

const EQUIPMENT_RENTAL_EXTRA_MONTHLY_FEES: Partial<
  Record<keyof EquipmentRentalEstimate['extraServices'], number>
> = {
  operator: RENTAL_EQUIPMENT_OPERATOR_MONTHLY_PEN,
  laptop: RENTAL_EQUIPMENT_LAPTOP_MONTHLY_PEN,
  residentTech: RENTAL_EQUIPMENT_RESIDENT_TECH_MONTHLY_PEN,
};

function resolveEquipmentRentalExtraServiceLabels(
  extraServices: EquipmentRentalEstimate['extraServices'],
): string[] {
  return (
    Object.keys(EQUIPMENT_RENTAL_EXTRA_LABELS) as Array<keyof typeof EQUIPMENT_RENTAL_EXTRA_LABELS>
  )
    .filter((key) => extraServices[key])
    .map((key) => EQUIPMENT_RENTAL_EXTRA_LABELS[key]);
}

function formatEquipmentRentalVariableFormula(estimate: EquipmentRentalEstimate): string {
  const pages = estimate.billablePages.toLocaleString('es-PE');
  const paperRate = estimate.isColorEquipment
    ? RENTAL_PAPER_SURCHARGE_COLOR_PEN
    : RENTAL_PAPER_SURCHARGE_BW_PEN;
  const paperNote =
    estimate.paperSurchargeMonthlyPen > 0
      ? ` + S/ ${paperRate} papel × ${pages} impresiones`
      : '';
  const finishingNote =
    estimate.finishingPerCopyPen > 0
      ? ` + acabados S/ ${estimate.finishingPerCopyPen}/pág.`
      : '';
  const scanNote =
    estimate.scanFeeMonthlyPen > 0
      ? ` + escaneo S/ ${formatPen(estimate.scanFeeMonthlyPen)}`
      : '';

  if (estimate.isColorEquipment) {
    const excess =
      estimate.excessFeeMonthlyPen > 0
        ? ` (excedentes negro S/ ${RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN} · color S/ ${RENTAL_COLOR_EXCESS_COPY_COST_PEN})`
        : '';
    return `Plan S/ ${formatPen(estimate.planBaseMonthlyPen)} + ${pages} pág.${excess}${paperNote}${finishingNote}${scanNote}`;
  }

  const excess =
    estimate.excessFeeMonthlyPen > 0
      ? ` (excedentes B/N S/ ${RENTAL_BW_COPY_COST_PEN})`
      : '';
  return `Plan S/ ${formatPen(estimate.planBaseMonthlyPen)} + ${pages} pág. A4 eq.${excess}${paperNote}${finishingNote}${scanNote}`;
}

export function buildEquipmentRentalQuoteSummaryNotes(estimate: EquipmentRentalEstimate): string[] {
  const extraLabels = resolveEquipmentRentalExtraServiceLabels(estimate.extraServices);
  const volumeNote = estimate.isColorEquipment
    ? `Impresiones/mes: ${estimate.blackPages.toLocaleString('es-PE')} negro + ${estimate.colorPages.toLocaleString('es-PE')} color`
    : `Impresiones/mes: ${estimate.a4Pages.toLocaleString('es-PE')} A4 + ${estimate.a3Pages.toLocaleString('es-PE')} A3 (= ${estimate.billablePages.toLocaleString('es-PE')} A4 eq.)`;

  return [
    'CONFIGURACIÓN DE ALQUILER DE EQUIPO',
    `Tipo: ${estimate.isColorEquipment ? 'Color' : 'B/N monocromático'}`,
    volumeNote,
    `Escaneos/mes: ${estimate.scanPages.toLocaleString('es-PE')}`,
    `Cantidad de equipos: ${estimate.equipmentQuantity}`,
    `Plazo de contrato: ${estimate.termMonths} meses`,
    extraLabels.length > 0
      ? `Servicios adicionales: ${extraLabels.join(', ')}`
      : 'Servicios adicionales: Ninguno',
    '',
    'RESUMEN ESTIMADO MENSUAL',
    `Cuota fija mensual: S/ ${formatPen(estimate.fixedFeeMonthlyPen)} — Valor del equipo + 20% (×1,2) ÷ ${estimate.termMonths} meses${estimate.laptopFeeMonthlyPen > 0 ? ` + laptop S/ ${formatPen(estimate.laptopFeeMonthlyPen)}` : ''}`,
    `Cuota variable mensual: S/ ${formatPen(estimate.variableFeeMonthlyPen)} — ${formatEquipmentRentalVariableFormula(estimate)}`,
    estimate.extraServicesMonthlyPen > 0
      ? `Personal mensual: S/ ${formatPen(estimate.extraServicesMonthlyPen)}`
      : null,
    `Total mensual: S/ ${formatPen(estimate.estimatedMonthlyPen)} — Desglose: cuota variable S/ ${formatPen(estimate.variableFeeMonthlyPen)} + cuota fija S/ ${formatPen(estimate.fixedFeeMonthlyPen)}${estimate.extraServicesMonthlyPen > 0 ? ` + personal S/ ${formatPen(estimate.extraServicesMonthlyPen)}` : ''}`,
    RENTAL_TERM_RENEWAL_NOTE,
  ].filter((line): line is string => line != null);
}

export function buildEquipmentRentalQuoteLines(
  estimate: EquipmentRentalEstimate,
  product: RentalQuoteProduct,
): QuoteProductData[] {
  const term = estimate.termMonths;
  const equipmentLabel =
    estimate.equipmentQuantity > 1
      ? `${estimate.equipmentQuantity} equipos`
      : '1 equipo';

  const equipmentOnlyFixedPen =
    Math.round((estimate.fixedFeeMonthlyPen - estimate.laptopFeeMonthlyPen) * 100) / 100;
  const paperRate = estimate.isColorEquipment
    ? RENTAL_PAPER_SURCHARGE_COLOR_PEN
    : RENTAL_PAPER_SURCHARGE_BW_PEN;

  const lines: QuoteProductData[] = [
    {
      name: `Alquiler de equipo — ${product.name} · cuota fija mensual (${term} meses · ${equipmentLabel})`,
      sku: product.sku,
      brand: product.brand,
      pricePen: equipmentOnlyFixedPen,
      quantity: 1,
      ...(product.imageUrl != null ? { imageUrl: product.imageUrl } : {}),
    },
    {
      name: `Plan de páginas · ${estimate.includedPages.toLocaleString('es-PE')} pág. incluidas/mes`,
      sku: 'PLAN-PAG',
      brand: 'Alquiler',
      pricePen: estimate.planBaseMonthlyPen,
      quantity: 1,
    },
  ];

  if (estimate.excessFeeMonthlyPen > 0) {
    lines.push({
      name: estimate.isColorEquipment
        ? `Excedentes impresión (negro S/ ${RENTAL_COLOR_BLACK_EXCESS_COPY_COST_PEN} · color S/ ${RENTAL_COLOR_EXCESS_COPY_COST_PEN})`
        : `Excedentes B/N (S/ ${RENTAL_BW_COPY_COST_PEN}/pág. A4 eq.)`,
      sku: 'EXC-COPY',
      brand: 'Alquiler',
      pricePen: estimate.excessFeeMonthlyPen,
      quantity: 1,
    });
  }

  if (estimate.extraServices.laptop && estimate.laptopFeeMonthlyPen > 0) {
    lines.push({
      name: `${EQUIPMENT_RENTAL_EXTRA_LABELS.laptop} — cuota fija mensual`,
      sku: 'EXTRA-LAPTOP',
      brand: 'Alquiler',
      pricePen: estimate.laptopFeeMonthlyPen,
      quantity: 1,
    });
  }

  if (estimate.extraServices.paper && estimate.paperSurchargeMonthlyPen > 0) {
    lines.push({
      name: `Suministro de papel (${estimate.billablePages.toLocaleString('es-PE')} × S/ ${paperRate})`,
      sku: 'PAPEL-ALQ',
      brand: 'Alquiler',
      pricePen: estimate.paperSurchargeMonthlyPen,
      quantity: 1,
    });
  }

  if (estimate.finishingSurchargeMonthlyPen > 0) {
    const finishingLabels = (
      ['laminator', 'guillotine', 'spiralBinder', 'ringBinder'] as const
    )
      .filter((key) => estimate.extraServices[key])
      .map((key) => EQUIPMENT_RENTAL_EXTRA_LABELS[key]);
    lines.push({
      name: `Acabados (${finishingLabels.join(', ')} · +S/ ${RENTAL_FINISHING_COPY_SURCHARGE_PEN}/pág. c/u)`,
      sku: 'ACABADOS',
      brand: 'Alquiler',
      pricePen: estimate.finishingSurchargeMonthlyPen,
      quantity: 1,
    });
  }

  if (estimate.scanFeeMonthlyPen > 0) {
    lines.push({
      name: `Escaneo excedente (S/ ${RENTAL_SCAN_EXCESS_COPY_COST_PEN}/pág.)`,
      sku: 'SCAN-EXC',
      brand: 'Alquiler',
      pricePen: estimate.scanFeeMonthlyPen,
      quantity: 1,
    });
  }

  (['operator', 'residentTech'] as const).forEach((key) => {
    if (!estimate.extraServices[key]) return;
    const monthlyPen = EQUIPMENT_RENTAL_EXTRA_MONTHLY_FEES[key];
    if (monthlyPen == null) return;
    lines.push({
      name: `${EQUIPMENT_RENTAL_EXTRA_LABELS[key]} — cuota mensual`,
      sku: `EXTRA-${key.toUpperCase()}`,
      brand: 'Alquiler',
      pricePen: monthlyPen,
      quantity: 1,
    });
  });

  return lines;
}

export async function buildEquipmentRentalQuotePdf(
  client: QuoteClientData,
  estimate: EquipmentRentalEstimate,
  product: RentalQuoteProduct,
  company: CompanySettings,
): Promise<GeneratedQuotePdf> {
  const lines = buildEquipmentRentalQuoteLines(estimate, product);
  const summaryNotes = buildEquipmentRentalQuoteSummaryNotes(estimate);
  return buildProductQuotePdf(client, lines, company, { summaryNotes });
}

export function buildRentalQuoteLines(
  breakdown: RentalCalculatorBreakdown,
  product: RentalQuoteProduct,
): QuoteProductData[] {
  const lines: QuoteProductData[] = [];
  const term = breakdown.termMonths;

  lines.push({
    name: `Plan de mantenimiento o suministros — ${product.name} · cuota fija mensual (${term} meses · ${RENTAL_TERM_RENEWAL_NOTE.replace(/\.$/, '')})`,
    sku: product.sku,
    brand: product.brand,
    pricePen: breakdown.baseMonthlyPen,
    quantity: 1,
    ...(product.imageUrl != null ? { imageUrl: product.imageUrl } : {}),
  });

  if (breakdown.excessChargesPen > 0) {
    lines.push({
      name: `Excedente copia (${breakdown.extraPages.toLocaleString('es-PE')} × S/ ${RENTAL_BW_COPY_COST_PEN})`,
      sku: 'EXC-NEG',
      brand: 'Plan mantenimiento',
      pricePen: breakdown.excessChargesPen,
      quantity: 1,
    });
  }

  if (breakdown.includesPaper && breakdown.paperChargesPen > 0) {
    lines.push({
      name: `Papel (${breakdown.monthlyPages.toLocaleString('es-PE')} × S/ ${RENTAL_PAPER_SURCHARGE_BW_PEN})`,
      sku: 'PAPEL',
      brand: 'Plan mantenimiento',
      pricePen: breakdown.paperChargesPen,
      quantity: 1,
    });
  }

  if (breakdown.includesOperator) {
    lines.push({
      name: `Operador — cuota fija mensual (S/ ${RENTAL_OPERATOR_MONTHLY_PEN.toLocaleString('es-PE')})`,
      sku: 'OPER',
      brand: 'Plan mantenimiento',
      pricePen: breakdown.operatorChargesPen,
      quantity: 1,
    });
  }

  return lines;
}

export async function buildRentalQuotePdf(
  client: QuoteClientData,
  breakdown: RentalCalculatorBreakdown,
  product: RentalQuoteProduct,
  company: CompanySettings,
): Promise<GeneratedQuotePdf> {
  const lines = buildRentalQuoteLines(breakdown, product);
  return buildProductQuotePdf(client, lines, company, {});
}
