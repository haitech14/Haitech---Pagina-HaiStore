import { appendNonRepeatingSubtitle } from './haiprint-rodillos-presion.js';

export const GENERICO_REVELADOR_COLOR_VARIANTS = [
  { suffix: 'Cyan', attribute: 'Cyan', slug: 'cyan' },
  { suffix: 'Magenta', attribute: 'Magenta', slug: 'magenta' },
  { suffix: 'Amarillo', attribute: 'Amarillo', slug: 'amarillo' },
  { suffix: 'Negro', attribute: 'Negro', slug: 'negro' },
];

/**
 * @param {{ title?: string; models?: string; cmyk?: boolean; colors?: string[] }} entry
 */
export function needsReveladorColorSplit(entry) {
  if (entry.cmyk === true) return true;
  if (Array.isArray(entry.colors) && entry.colors.length > 0) return true;
  const haystack = `${entry.title ?? ''} ${entry.models ?? ''}`;
  return /\bCMYK\b/i.test(haystack);
}

/**
 * @param {{ slug: string; colors?: string[]; cmyk?: boolean; title?: string; models?: string }} entry
 */
export function expandReveladorCatalogEntry(entry) {
  if (!needsReveladorColorSplit(entry)) {
    return [{ ...entry, productSlug: entry.slug }];
  }

  /** @type {typeof GENERICO_REVELADOR_COLOR_VARIANTS} */
  let variants = GENERICO_REVELADOR_COLOR_VARIANTS;
  if (Array.isArray(entry.colors) && entry.colors.length > 0) {
    variants = entry.colors.map((label) => {
      const known = GENERICO_REVELADOR_COLOR_VARIANTS.find(
        (variant) => variant.suffix === label || variant.attribute === label,
      );
      if (known) return known;
      const slug = String(label).trim().toLowerCase();
      return { suffix: label, attribute: label, slug };
    });
  }

  return variants.map((variant) => ({
    ...entry,
    productSlug: `${entry.slug}-${variant.slug}`,
    color: variant.suffix,
    colorAttribute: variant.attribute,
  }));
}

/**
 * @param {Array<{ slug: string; colors?: string[]; cmyk?: boolean; title?: string; models?: string }>} catalog
 */
export function expandReveladorCatalog(catalog) {
  return catalog.flatMap((entry) => expandReveladorCatalogEntry(entry));
}

/**
 * @param {{ title: string; models?: string; compatibleBrand: string; color?: string }} input
 */
export function buildReveladorProductName({ title, models, compatibleBrand, color }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^REVELADOR\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `Revelador Compatible Generico ${brand} ${modelPart}`.replace(/\s{2,}/g, ' ').trim();
  if (color) {
    return `${base} ${color}`.replace(/\s{2,}/g, ' ').trim();
  }
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
