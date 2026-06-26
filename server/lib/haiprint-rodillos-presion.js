/** @param {unknown} text */
export function normalizeForCompare(text) {
  return String(text).toUpperCase().replace(/[^A-Z0-9]+/g, '');
}

/**
 * @param {string} name
 * @param {string} subtitle
 * @param {string} [modelPart]
 */
export function appendNonRepeatingSubtitle(name, subtitle, modelPart = '') {
  const trimmed = String(subtitle ?? '').trim();
  if (!trimmed) return name;

  const nameNorm = normalizeForCompare(name);
  if (nameNorm.includes(normalizeForCompare(trimmed))) return name;

  const model = String(modelPart ?? '').trim();
  if (model) {
    const modelNorm = normalizeForCompare(model);
    const subNorm = normalizeForCompare(trimmed);
    if (subNorm.startsWith(modelNorm)) {
      let remainder = trimmed.slice(model.length).trim();
      if (remainder.startsWith('/')) remainder = remainder.slice(1).trim();
      if (!remainder) return name;
      if (!nameNorm.includes(normalizeForCompare(remainder))) {
        const joiner = trimmed.includes('/') && !name.includes('/') ? '/' : ' ';
        return `${name}${joiner}${remainder}`.replace(/\s{2,}/g, ' ').trim();
      }
      return name;
    }

    if (trimmed.includes('/')) {
      const [head, ...tail] = trimmed.split('/');
      if (normalizeForCompare(head) === modelNorm && tail.length > 0) {
        const suffix = tail.join('/').trim();
        if (suffix && !nameNorm.includes(normalizeForCompare(suffix))) {
          return `${name}/${suffix}`.replace(/\s{2,}/g, ' ').trim();
        }
        return name;
      }
    }
  }

  const parts = trimmed.split(/[\s/,]+/).filter(Boolean);
  const extra = parts.filter((part) => !nameNorm.includes(normalizeForCompare(part.replace(/[()]/g, ''))));
  if (extra.length === 0) return name;
  return `${name} ${extra.join(' ')}`.replace(/\s{2,}/g, ' ').trim();
}

/**
 * @param {{ title: string; models?: string; compatibleBrand: string }} input
 */
export function buildRodilloPresionProductName({ title, models, compatibleBrand }) {
  const modelPart = String(title ?? '')
    .trim()
    .replace(/^RODILLO\s+DE\s+PRESI[ÓO]N\s*/i, '')
    .replace(/^RODILLO\s+DE\s+CARGA\s*/i, '')
    .trim();
  const brand = String(compatibleBrand ?? '').trim();
  const base = `RODILLO DE PRESIÓN Compatible HaiPrint ${brand} ${modelPart}`.replace(/\s{2,}/g, ' ').trim();
  return appendNonRepeatingSubtitle(base, models, modelPart);
}
