import { appendNonRepeatingSubtitle } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildCuchillaCilindroProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^C\.?\s*DE\s+LIMPIEZA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Cuchilla de Cilindro Compatible HaiPrint ${brand} ${modelPart}`.replace(/\s{2,}/g, ' ').trim();
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
