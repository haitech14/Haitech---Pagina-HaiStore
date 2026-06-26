import { normalizeForCompare } from './haiprint-rodillos-presion.js';

/**
 * @param {{ title: string; models?: string }} input
 */
export function buildBocinaProductName({ title, models }) {
  const trimmedTitle = String(title ?? '').trim();
  const base = `${trimmedTitle} Compatible RICOH`.replace(/\s{2,}/g, ' ').trim();
  const trimmedModels = String(models ?? '').trim();
  if (!trimmedModels) return base;
  if (normalizeForCompare(base).includes(normalizeForCompare(trimmedModels))) return base;
  return `${base} ${trimmedModels}`.replace(/\s{2,}/g, ' ').trim();
}
