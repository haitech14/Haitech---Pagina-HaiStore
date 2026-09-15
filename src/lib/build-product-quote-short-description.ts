import {
  isColorPrinterEquipment,
  isPrinterEquipment,
} from '@/lib/build-product-detail';
import { resolveProductHeroConditionLabel } from '@/lib/product-hero-meta';
import type { SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { Product } from '@/types/product';

export interface ProductQuoteDescriptionOptions {
  selectedOptions?: SelectedEquipmentOption[];
}

/** Serie Ricoh IM / IMC (p. ej. IM 430F, IM C3000). No incluye MP. */
export function isRicohImSeriesEquipment(product: Product): boolean {
  const haystack = `${product.name} ${product.code ?? ''} ${product.slug ?? ''}`;
  return /\bIM\s*C?\s*\d{3,4}/i.test(haystack) || /\bIMC\s*\d{3,4}/i.test(haystack);
}

function buildAccessoryBullets(product: Product): string[] {
  const color = isColorPrinterEquipment(product);
  return [
    'Alimentador de Originales',
    color
      ? '02 caseteras de papel de 250 hojas c/u'
      : '01 casetera de papel de 250 hojas',
    color ? '01 casetera bypass de 50 hojas' : '01 casetera bypass de 100 hojas',
    '01 pantalla Tablet Android de 10.1" pulgadas',
    color
      ? '04 tóner Cartucho Nuevos Cyan, Magenta, Yellow, Negro'
      : '01 tóner Cartucho Nuevo Negro',
  ];
}

function buildIncludedBullets(product: Product): string[] {
  const lines = [
    'ENVIO GRATIS (Lima Metropolitana o Agencia)',
    'Instalación, configuración y capacitación en su oficina a todo su personal sin costo alguno',
  ];
  if (isRicohImSeriesEquipment(product)) {
    lines.push(
      'Suscripción GRATIS 01 año a Ricoh Smart Suite (Software de Monitoreo Remoto y actualizaciones del sistema)',
    );
  }
  return lines;
}

function isSupportWarrantyCondition(label: string): boolean {
  const normalized = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  return (
    normalized.includes('seminueva') ||
    normalized.includes('seminuevo') ||
    normalized.includes('remanufactur')
  );
}

const EQUIPMENT_WARRANTY_REST =
  '1 año y/o 20,000 páginas lo que ocurre primero siempre y cuando corriente estable caso contrario utilizar estabilizador sólido 2000 watts para fotocopiadoras con llave térmica';

export function buildEquipmentQuoteWarrantyLine(conditionLabel: string): string {
  const prefix = isSupportWarrantyCondition(conditionLabel)
    ? 'Garantía en Servicio Técnico'
    : 'Garantía de Fábrica';
  return `${prefix} ${EQUIPMENT_WARRANTY_REST}`;
}

/**
 * Descripción corta para la fila DESCRIPCIÓN de la cotización PDF.
 * En equipos: condición, accesorios incluidos y beneficios (envío, instalación, Smart Suite IM).
 */
export function buildProductQuoteShortDescription(
  product: Product,
  _options?: ProductQuoteDescriptionOptions,
): string | null {
  if (!isPrinterEquipment(product)) {
    const plain = product.description?.trim();
    return plain || null;
  }

  const condition = resolveProductHeroConditionLabel(product)?.trim() || 'Seminueva';
  const accessories = buildAccessoryBullets(product);
  const included = buildIncludedBullets(product);
  const warranty = buildEquipmentQuoteWarrantyLine(condition);

  return [
    `Condición: ${condition}`,
    '',
    'Accesorios que incluyen:',
    ...accessories.map((line) => `• ${line}`),
    '',
    'Incluye:',
    ...included.map((line) => `• ${line}`),
    '',
    'Garantía:',
    `• ${warranty}`,
  ].join('\n');
}
