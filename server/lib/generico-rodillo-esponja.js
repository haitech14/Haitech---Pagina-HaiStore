import { appendNonRepeatingSubtitle } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildRodilloEsponjaProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^RODILLO\s+DE\s+ESPONJA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Rodillo de Esponja Compatible Generico ${brand} ${modelPart}`
    .replace(/\s{2,}/g, ' ')
    .trim();
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
