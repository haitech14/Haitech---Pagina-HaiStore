/** Precio Corporativo 2 fijo en soles (termina en 9). Claves: id vitrina, id catálogo o código. */
export const CORPORATIVO2_FIXED_PEN_BY_KEY = {
  'im-430f': 4099,
  'ricoh-im-430f': 4099,
  '418491': 4099,
  'mp-305-plus': 4049,
  'ab878d89-61e0-4e51-a941-03455e1da407': 4049,
  'MP-305+': 4049,
};

/** Precio Corporativo 2 fijo en USD (Corporativo + 100). */
export const CORPORATIVO2_FIXED_USD_BY_KEY = {
  'cb1e47b2-d784-4bef-ae18-d4dae08723e4': 1249,
  '418787-CP04H4': 1249,
  '481dbc77-436b-464d-b76f-930f7d79f4ff': 2279,
  'im-c320f': 2279,
  '418787': 2279,
  '5a142c47-521c-47af-92ec-dda8808907c9': 2949,
  'im-c401f': 2949,
  '423693': 2949,
};

function resolveKeyedNumber(map, keys) {
  for (const key of keys) {
    if (key == null) continue;
    const trimmed = String(key).trim();
    if (!trimmed) continue;
    const direct = map[trimmed];
    if (direct != null && direct > 0) return direct;
    const upper = trimmed.toUpperCase();
    const byUpper = map[upper];
    if (byUpper != null && byUpper > 0) return byUpper;
  }
  return null;
}

/**
 * @param {...(string | null | undefined)} keys
 * @returns {number | null}
 */
export function resolveCorporativo2FixedPen(...keys) {
  return resolveKeyedNumber(CORPORATIVO2_FIXED_PEN_BY_KEY, keys);
}

/**
 * @param {...(string | null | undefined)} keys
 * @returns {number | null}
 */
export function resolveCorporativo2FixedUsd(...keys) {
  return resolveKeyedNumber(CORPORATIVO2_FIXED_USD_BY_KEY, keys);
}
