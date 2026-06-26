import { normalizeForCompare } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildEngranajePinonProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^ENGRANAJE\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Engranaje/Piñon Compatible Generico ${brand}${modelPart ? ` ${modelPart}` : ''}`
    .replace(/\s{2,}/g, ' ')
    .trim();
  const trimmedModels = String(models ?? '').trim();
  if (!trimmedModels) return base;
  if (normalizeForCompare(base).includes(normalizeForCompare(trimmedModels))) return base;
  return `${base} ${trimmedModels}`.replace(/\s{2,}/g, ' ').trim();
}
