import {
  conditionLabel,
  equipmentLabel,
  formatSolutionPen,
  formatSolutionTermLabel,
  modelById,
  SOLUTION_MIN_MONTHLY_PEN,
  type SolutionConfiguratorState,
  type SolutionQuoteBreakdown,
} from '@/data/rental-solution-configurator';
import {
  buildProductQuotePdf,
  type GeneratedQuotePdf,
  type QuoteClientData,
  type QuoteProductData,
} from '@/lib/generate-product-quote-pdf';
import type { CompanySettings } from '@/types/company-settings';

export interface SolutionRentalQuoteProduct {
  name: string;
  sku: string;
  brand: string;
  imageUrl?: string | null;
}

function activeExtraLabels(state: SolutionConfiguratorState): string[] {
  const labels: string[] = [];
  if (state.extras.operador) labels.push('Operador');
  if (state.extras.papel) labels.push('Papel');
  if (state.extras.oficina) labels.push('Equipos de oficina');
  return labels;
}

export function buildSolutionRentalQuoteSummaryNotes(
  state: SolutionConfiguratorState,
  quote: SolutionQuoteBreakdown,
): string[] {
  const model = modelById(state.modelId);
  const extras = activeExtraLabels(state);
  const volumeNote = model.usesPrintVolume
    ? model.printType === 'color'
      ? `Volumen: ${state.blackPages.toLocaleString('es-PE')} negro + ${state.colorPages.toLocaleString('es-PE')} color`
      : `Volumen: ${state.volumePages.toLocaleString('es-PE')} págs/mes (${model.paperFormat})`
    : 'Sin bolsa de impresión';

  return [
    'CONFIGURACIÓN DE ALQUILER / LEASING',
    `Equipo: ${equipmentLabel(state)}`,
    `Condición: ${conditionLabel(state.condition)}`,
    `Cantidad: ${state.quantity}`,
    `Plazo: ${formatSolutionTermLabel(state.termMonths)}`,
    volumeNote,
    `Ciudad: ${state.city.trim() || 'Lima'}`,
    state.district.trim() ? `Distrito: ${state.district.trim()}` : null,
    extras.length > 0 ? `Adicionales: ${extras.join(', ')}` : 'Adicionales: Ninguno',
    '',
    'DESGLOSE MENSUAL ESTIMADO (SIN IGV)',
    state.condition === 'nueva'
      ? `Cuota equipo (corp. + 20% / ${formatSolutionTermLabel(state.termMonths)}): ${formatSolutionPen(quote.equipmentFinanceMonthly, 2)}`
      : null,
    model.usesPrintVolume
      ? `Impresión bolsa + excedentes: ${formatSolutionPen(quote.printBundleMonthly, 2)}`
      : `Cuota base: ${formatSolutionPen(quote.planBaseMonthly, 2)}`,
    model.usesPrintVolume
      ? `  Bolsa (${quote.includedPages.toLocaleString('es-PE')} págs): ${formatSolutionPen(quote.planBaseMonthly, 2)}`
      : null,
    model.usesPrintVolume
      ? quote.copyVariableMonthly > 0
        ? model.printType === 'color'
          ? `  Excedentes (negro ${state.excessBlackPages.toLocaleString('es-PE')} + color ${state.excessColorPages.toLocaleString('es-PE')}): ${formatSolutionPen(quote.copyVariableMonthly, 2)}`
          : `  Excedentes (${quote.excessPages.toLocaleString('es-PE')} págs): ${formatSolutionPen(quote.copyVariableMonthly, 2)}`
        : '  Excedentes: S/ 0.00'
      : null,
    model.usesPrintVolume
      ? `Escaneo (cortesía ${quote.scanCourtesyPages.toLocaleString('es-PE')} · excedente ${quote.scanExcessPages.toLocaleString('es-PE')}): ${formatSolutionPen(quote.scanMonthly, 2)}`
      : null,
    `Envío (${model.paperFormat}: S/ ${quote.shippingLegPen} ida + S/ ${quote.shippingLegPen} vuelta = ${formatSolutionPen(quote.shippingTotalPen)} / ${formatSolutionTermLabel(state.termMonths)}): ${formatSolutionPen(quote.shippingMonthly, 2)}`,
    quote.minMonthlyApplied > 0
      ? `Mínimo mensual (${formatSolutionPen(SOLUTION_MIN_MONTHLY_PEN)}): ${formatSolutionPen(quote.minMonthlyApplied, 2)}`
      : null,
    quote.extrasMonthly > 0
      ? `Servicios adicionales: ${formatSolutionPen(quote.extrasMonthly, 2)}`
      : null,
    `Subtotal sin IGV: ${formatSolutionPen(quote.subtotalMonthly, 2)}`,
    `IGV 18%: ${formatSolutionPen(quote.igvMonthly, 2)}`,
    `TOTAL MENSUAL (incl. IGV): ${formatSolutionPen(quote.totalMonthly, 2)}`,
  ].filter((line): line is string => line != null);
}

export function buildSolutionRentalQuoteLines(
  state: SolutionConfiguratorState,
  quote: SolutionQuoteBreakdown,
  product: SolutionRentalQuoteProduct,
): QuoteProductData[] {
  const model = modelById(state.modelId);
  const term = state.termMonths;
  const qtyLabel = state.quantity > 1 ? `${state.quantity} equipos` : '1 equipo';
  const lines: QuoteProductData[] = [];

  if (quote.equipmentFinanceMonthly > 0) {
    lines.push({
      name: `Cuota equipo nuevo — ${product.name} · (venta corp. + 20%) / ${term} meses · ${qtyLabel}`,
      sku: product.sku,
      brand: product.brand,
      pricePen: quote.equipmentFinanceMonthly,
      quantity: 1,
      ...(product.imageUrl != null ? { imageUrl: product.imageUrl } : {}),
    });
  }

  if (model.usesPrintVolume) {
    lines.push({
      name: `Bolsa de impresión · ${quote.includedPages.toLocaleString('es-PE')} págs incluidas/mes · ${qtyLabel}`,
      sku: 'PLAN-PAG',
      brand: 'Alquiler',
      pricePen: quote.planBaseMonthly,
      quantity: 1,
      ...(quote.equipmentFinanceMonthly <= 0 && product.imageUrl != null
        ? { imageUrl: product.imageUrl }
        : {}),
    });
  } else if (quote.planBaseMonthly > 0) {
    lines.push({
      name: `Alquiler — ${product.name} · cuota mensual · ${qtyLabel}`,
      sku: product.sku,
      brand: product.brand,
      pricePen: quote.planBaseMonthly,
      quantity: 1,
      ...(product.imageUrl != null ? { imageUrl: product.imageUrl } : {}),
    });
  }

  if (quote.copyVariableMonthly > 0) {
    lines.push({
      name:
        model.printType === 'color'
          ? `Excedentes impresión (negro S/ ${quote.colorBlackCopyCost} · color S/ ${quote.colorCopyCost} + IGV)`
          : `Excedentes B/N (S/ ${quote.bwCopyCost}/pág. A4 eq. + IGV)`,
      sku: 'EXC-COPY',
      brand: 'Alquiler',
      pricePen: quote.copyVariableMonthly,
      quantity: 1,
    });
  }

  if (quote.scanMonthly > 0) {
    lines.push({
      name: `Escaneo excedente (cortesía ${quote.scanCourtesyPages.toLocaleString('es-PE')} págs · S/ ${quote.scanCopyCost}/pág. + IGV)`,
      sku: 'SCAN-EXC',
      brand: 'Alquiler',
      pricePen: quote.scanMonthly,
      quantity: 1,
    });
  }

  if (quote.shippingMonthly > 0) {
    lines.push({
      name: `Costo de envío ${model.paperFormat} (S/ ${quote.shippingLegPen} ida + S/ ${quote.shippingLegPen} vuelta / ${term} meses)`,
      sku: 'ENVIO',
      brand: 'Alquiler',
      pricePen: quote.shippingMonthly,
      quantity: 1,
    });
  }

  if (quote.locationMonthly > 0) {
    lines.push({
      name: 'Recargo ubicación (provincias)',
      sku: 'UBIC',
      brand: 'Alquiler',
      pricePen: quote.locationMonthly,
      quantity: 1,
    });
  }

  return refineExtraLines(state, quote, lines);
}

function refineExtraLines(
  state: SolutionConfiguratorState,
  quote: SolutionQuoteBreakdown,
  baseLines: QuoteProductData[],
): QuoteProductData[] {
  const lines = [...baseLines];

  if (state.extras.operador) {
    lines.push({
      name: 'Operador — cuota mensual',
      sku: 'OPER',
      brand: 'Alquiler',
      pricePen: 2000,
      quantity: 1,
    });
  }
  if (state.extras.oficina) {
    lines.push({
      name: 'Equipos de oficina (enmicadora, anilladora, espiraladora, guillotina)',
      sku: 'OFICINA',
      brand: 'Alquiler',
      pricePen: 250,
      quantity: 1,
    });
  }
  if (state.extras.papel) {
    const paperPen = Math.max(
      0,
      quote.extrasMonthly -
        (state.extras.operador ? 2000 : 0) -
        (state.extras.oficina ? 250 : 0),
    );
    if (paperPen > 0) {
      lines.push({
        name: `Suministro de papel (${quote.billablePages.toLocaleString('es-PE')} págs)`,
        sku: 'PAPEL',
        brand: 'Alquiler',
        pricePen: paperPen,
        quantity: 1,
      });
    }
  }

  return lines;
}

export async function buildSolutionRentalQuotePdf(
  client: QuoteClientData,
  state: SolutionConfiguratorState,
  quote: SolutionQuoteBreakdown,
  product: SolutionRentalQuoteProduct,
  company: CompanySettings,
): Promise<GeneratedQuotePdf> {
  const lines = buildSolutionRentalQuoteLines(state, quote, product);
  const summaryNotes = buildSolutionRentalQuoteSummaryNotes(state, quote);
  return buildProductQuotePdf(client, lines, company, { summaryNotes });
}

export function buildSolutionQuoteWhatsAppMessage(input: {
  client: QuoteClientData;
  state: SolutionConfiguratorState;
  quote: SolutionQuoteBreakdown;
  quoteNumber?: string;
}): string {
  const { client, state, quote, quoteNumber } = input;
  const model = modelById(state.modelId);
  const extras = activeExtraLabels(state);
  const volumeLine = model.usesPrintVolume
    ? model.printType === 'color'
      ? `Volumen: ${state.blackPages.toLocaleString('es-PE')} negro + ${state.colorPages.toLocaleString('es-PE')} color`
      : `Volumen: ${state.volumePages.toLocaleString('es-PE')} págs/mes`
    : null;

  return [
    `¡Hola! Soy *${client.atencion.trim()}*`,
    '',
    quoteNumber
      ? `Solicito formalizar la *proforma ${quoteNumber}* de alquiler Ricoh:`
      : 'Solicito cotización / proforma de alquiler Ricoh:',
    '',
    `*${equipmentLabel(state)}*`,
    `Condición: *${conditionLabel(state.condition)}*`,
    `Cantidad: *${state.quantity}*`,
    `Plazo: *${formatSolutionTermLabel(state.termMonths)}*`,
    volumeLine ? `*${volumeLine}*` : null,
    `Ciudad: *${state.city.trim() || 'Lima'}*`,
    state.district.trim() ? `Distrito: *${state.district.trim()}*` : null,
    extras.length > 0 ? `Adicionales: ${extras.join(', ')}` : null,
    `Cuota estimada: *${formatSolutionPen(quote.totalMonthly)} / mes*`,
    '',
    '*Mis datos:*',
    `RUC/DNI: ${client.ruc.trim()}`,
    `Razón social: ${client.razonSocial.trim()}`,
    `Celular: ${client.celular.trim()}`,
    `Dirección: ${client.direccion.trim()}`,
    `Ciudad: ${client.ciudad.trim()}`,
    '',
    quoteNumber
      ? `Adjunto / generé la proforma ${quoteNumber}. ¿Me confirman la propuesta?`
      : '¿Me pueden enviar la propuesta formal?',
    '¡Gracias!',
  ]
    .filter((line): line is string => line != null)
    .join('\n');
}

export function solutionQuoteProductFromState(
  state: SolutionConfiguratorState,
): SolutionRentalQuoteProduct {
  const model = modelById(state.modelId);
  return {
    name: model.label,
    sku: model.id.toUpperCase(),
    brand: 'RICOH',
    imageUrl: model.image,
  };
}
