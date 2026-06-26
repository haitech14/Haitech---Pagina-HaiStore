import { appendNonRepeatingSubtitle, normalizeForCompare } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildFajaTransferenciaProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^FAJA\s+DE\s+TRANSFERENCIA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const subtitle = String(models ?? '').trim();
  const model = modelPart || subtitle;
  const base = `Faja de Transferencia Compatible Generico ${brand} ${model}`
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!modelPart || !subtitle || normalizeForCompare(modelPart) === normalizeForCompare(subtitle)) {
    return base;
  }

  return appendNonRepeatingSubtitle(base, subtitle, modelPart);
}
