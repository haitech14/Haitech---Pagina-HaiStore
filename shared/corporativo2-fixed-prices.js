/** Precio Corporativo 2 fijo en soles (termina en 9). Claves: id vitrina, id catálogo o código. */
export const CORPORATIVO2_FIXED_PEN_BY_KEY = {
  'im-430f': 4099,
  'ricoh-im-430f': 4099,
  '418491': 4099,
  'mp-305-plus': 4049,
  'ab878d89-61e0-4e51-a941-03455e1da407': 4049,
  'MP-305+': 4049,
};

/**
 * @param {...(string | null | undefined)} keys
 * @returns {number | null}
 */
export function resolveCorporativo2FixedPen(...keys) {
  for (const key of keys) {
    if (key == null) continue;
    const trimmed = String(key).trim();
    if (!trimmed) continue;
    const direct = CORPORATIVO2_FIXED_PEN_BY_KEY[trimmed];
    if (direct != null && direct > 0) return direct;
    const upper = trimmed.toUpperCase();
    const byUpper = CORPORATIVO2_FIXED_PEN_BY_KEY[upper];
    if (byUpper != null && byUpper > 0) return byUpper;
  }
  return null;
}
