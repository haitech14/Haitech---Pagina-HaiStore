import { appendNonRepeatingSubtitle, normalizeForCompare } from './haiprint-rodillos-presion.js';

const PRODUCT_NAME_PREFIX =
  'Kit de Ruedas de casetera compatible Pickup Roller/ Separation Roller/ Feed Roller';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildRuedasCaseteraProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^KITS?\s+DE\s+RUEDAS\s+DE\s+CASETERA\s*/i, '')
    .replace(/^RUEDA\s+DE\s+CASETERA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `${PRODUCT_NAME_PREFIX} Compatible Generico ${brand}${modelPart ? ` ${modelPart}` : ''}`
    .replace(/\s{2,}/g, ' ')
    .trim();
  const trimmedModels = String(models ?? '').trim();
  if (!trimmedModels) return base;
  if (normalizeForCompare(base).includes(normalizeForCompare(trimmedModels))) return base;
  return `${base} ${trimmedModels}`.replace(/\s{2,}/g, ' ').trim();
}
