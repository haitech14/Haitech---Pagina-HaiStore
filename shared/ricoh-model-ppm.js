const MODEL_NUMBER_PATTERNS = [
  /\bMP\s+C\s*(\d+)/i,
  /\bMP\s+(\d+)/i,
  /\bIM\s+C\s*(\d+)/i,
  /\bIM\s+(\d+)/i,
  /\bIM-C\s*(\d+)/i,
  /\bIMC(\d+)/i,
];

/**
 * Bloque numérico del modelo tras MP / MP C / IM / IM C (p. ej. «2000», «307», «5500»).
 * @param {string} name
 * @returns {string | null}
 */
export function inferRicohModelNumberBlock(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return null;

  for (const pattern of MODEL_NUMBER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Dos primeros dígitos del bloque numérico del modelo = ppm (p. ej. C2000 → «20»).
 * @param {string} name
 * @returns {string | null}
 */
export function inferPpmDigitsFromRicohModelName(name) {
  const block = inferRicohModelNumberBlock(name);
  if (!block) return null;
  if (block.length === 1) return `0${block}`;
  return block.slice(0, 2);
}

/**
 * @param {string | null | undefined} ppmDigits
 */
export function formatPpmLabel(ppmDigits) {
  const digits = String(ppmDigits ?? '').trim();
  return digits ? `${digits} ppm` : null;
}

/**
 * @param {string} name
 */
export function inferPpmLabelFromRicohModelName(name) {
  return formatPpmLabel(inferPpmDigitsFromRicohModelName(name));
}

/**
 * Primer dígito del bloque numérico × 10 000 (p. ej. C2000 → 20 000 páginas/mes).
 * @param {string} name
 * @returns {number | null}
 */
export function inferMonthlyProductionPagesFromRicohModelName(name) {
  const block = inferRicohModelNumberBlock(name);
  if (!block) return null;
  const firstDigit = Number(block[0]);
  if (!Number.isFinite(firstDigit) || firstDigit <= 0) return null;
  return firstDigit * 10_000;
}

/**
 * @param {number | null | undefined} pages
 */
export function formatMonthlyProductionLabel(pages) {
  const value = Number(pages);
  if (!Number.isFinite(value) || value <= 0) return null;
  return `${value.toLocaleString('es-PE')} páginas/mes`;
}

/**
 * @param {string} name
 */
export function inferMonthlyProductionLabelFromRicohModelName(name) {
  return formatMonthlyProductionLabel(inferMonthlyProductionPagesFromRicohModelName(name));
}

/**
 * Mapea páginas/mes al tier de filtro «Producción» del catálogo.
 * @param {number | null | undefined} pages
 */
export function inferProduccionTierFromMonthlyPages(pages) {
  const value = Number(pages);
  if (!Number.isFinite(value) || value <= 0) return 'Basico (>5000 páginas)';
  if (value >= 200_000) return 'Producción (200,000 a 500,000 páginas aprox)';
  if (value >= 50_000) return 'Alta Producción (50,000 páginas aprox)';
  if (value >= 15_000) return 'Mediano (15,000 páginas aprox)';
  return 'Basico (>5000 páginas)';
}

/**
 * @param {string} name
 */
export function inferProduccionTierFromRicohModelName(name) {
  return inferProduccionTierFromMonthlyPages(
    inferMonthlyProductionPagesFromRicohModelName(name),
  );
}

/**
 * @param {{ category?: string | null; name?: string | null }} product
 */
export function isRicohImMpCatalogEquipment(product) {
  const category = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '');
  const isEquipment =
    category.includes('multifuncional') ||
    category.includes('impresor') ||
    /\bmultifuncional\b/i.test(name);
  if (!isEquipment) return false;
  return inferRicohModelNumberBlock(name) != null;
}

export function isMultifuncionalNuevaOSeminueva(product) {
  const category = String(product?.category ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  const isMultifunc =
    category.includes('multifuncional') || /\bmultifuncional\b/i.test(name);
  if (!isMultifunc) return false;

  return (
    category.includes('nueva') ||
    category.includes('seminueva') ||
    /\bnueva\b/.test(name) ||
    /\bseminueva\b/.test(name)
  );
}

/**
 * Velocidad según modelo Ricoh IM/MP para equipos de catálogo.
 * @param {{ category?: string | null; name?: string | null }}
 */
export function resolveMultifuncionalVelocidadFromModel(product) {
  if (!isRicohImMpCatalogEquipment(product)) return null;
  return inferPpmLabelFromRicohModelName(product?.name ?? '');
}

/**
 * Volumen mensual según modelo Ricoh IM/MP.
 * @param {{ category?: string | null; name?: string | null }}
 */
export function resolveRicohMonthlyProductionFromModel(product) {
  if (!isRicohImMpCatalogEquipment(product)) return null;
  return inferMonthlyProductionLabelFromRicohModelName(product?.name ?? '');
}
