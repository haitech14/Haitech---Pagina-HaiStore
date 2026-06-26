import { appendNonRepeatingSubtitle } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildAlmohadillaProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^ALMOHADILLA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Almohadilla Compatible HaiPrint ${brand} ${modelPart}`.replace(/\s{2,}/g, ' ').trim();
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
