import { appendNonRepeatingSubtitle } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildBarraLubricadoraProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^B\.?\s*LUBRICADORA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Barra Lubricadora Compatible Generico ${brand} ${modelPart}`
    .replace(/\s{2,}/g, ' ')
    .trim();
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
