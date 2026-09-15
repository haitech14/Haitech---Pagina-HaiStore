import {
  inferColor,
  inferProduccionTier,
  resolveFormatoPapelDisplayLabel,
} from '@/lib/category-catalog-filters';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import { resolveProductSpeedPpm } from '../../shared/catalog-speed-filter.js';

export type ProductCardHoverFeature = {
  id: string;
  label: string;
  value: string;
};

function formatMonthlyCycle(tier: string): string {
  if (tier.includes('200,000')) return '200,000–500,000/mes';
  if (tier.includes('50,000')) return '50,000/mes';
  if (tier.includes('15,000')) return '15,000/mes';
  if (tier.includes('5000') || tier.includes('5,000')) return '5,000/mes';
  return tier;
}

/** Specs del panel hover: impresión, ppm, formato y ciclo. */
export function buildProductCardHoverFeatures(
  product: ProductBadgeSource,
): ProductCardHoverFeature[] {
  if (!isPrinterProduct(product) || isTonerOrRepuestosCategory(product.category)) {
    return [];
  }

  const features: ProductCardHoverFeature[] = [];
  const isColor = inferColor(product) === 'Color';
  features.push({
    id: 'tecnologia',
    label: 'Tecnología',
    value: isColor ? 'Color' : 'B/N monocromática',
  });

  const ppm = resolveProductSpeedPpm(product);
  if (ppm != null) {
    features.push({
      id: 'velocidad',
      label: 'Velocidad',
      value: `${ppm} ppm`,
    });
  }

  const formato = resolveFormatoPapelDisplayLabel(product);
  if (formato) {
    features.push({
      id: 'formato',
      label: 'Formato',
      value: formato,
    });
  }

  features.push({
    id: 'ciclo',
    label: 'Ciclo mensual',
    value: formatMonthlyCycle(inferProduccionTier(product)),
  });

  return features;
}
