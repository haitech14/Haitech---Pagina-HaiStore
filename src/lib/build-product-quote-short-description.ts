import { isPrinterEquipment } from '@/lib/build-product-detail';
import {
  buildEquipmentCommercialDescription,
  isRicohImSeriesEquipment,
} from '@/lib/build-equipment-commercial-description';
import { resolveProductHeroConditionLabel } from '@/lib/product-hero-meta';
import type { SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { Product } from '@/types/product';

export interface ProductQuoteDescriptionOptions {
  selectedOptions?: SelectedEquipmentOption[];
}

export { isRicohImSeriesEquipment };

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
 * Usa el mismo formato comercial que la ficha de producto.
 */
export function buildProductQuoteShortDescription(
  product: Product,
  _options?: ProductQuoteDescriptionOptions,
): string | null {
  if (!isPrinterEquipment(product)) {
    const plain = product.description?.trim();
    return plain || null;
  }

  const commercial = buildEquipmentCommercialDescription(product);
  if (commercial) return commercial;

  const condition = resolveProductHeroConditionLabel(product)?.trim() || 'Seminueva';
  return [
    `Condición: ${condition}`,
    '',
    'Garantía:',
    `• ${buildEquipmentQuoteWarrantyLine(condition)}`,
  ].join('\n');
}
