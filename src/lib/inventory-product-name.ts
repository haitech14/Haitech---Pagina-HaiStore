/** Códigos de color Ricoh en cartuchos → sufijo legible. */
export const TONER_COLOR_CODE_LABELS = {
  BK: 'Negro',
  CY: 'Cyan',
  MG: 'Magenta',
  YW: 'Amarillo',
} as const;

export type TonerColorCode = keyof typeof TONER_COLOR_CODE_LABELS;

const TONER_COLOR_CODE_PATTERN = /\b(BK|CY|MG|YW)\b/i;
const TONER_COLOR_SUFFIX_PATTERN = /\s+(Negro|Cyan|Magenta|Amarillo|Yellow)\s*$/i;
const PRINT_CARTRIDGE_LABEL_PATTERN = /\bPRINT\s*CARTRIDGE\b|\bPRINT\s*CART\b/gi;

/** Sustituye «Print Cartridge» / «PRINT CART» por «Toner Cartucho Original». */
export function normalizeTonerCartridgeProductLabel(name: string): string {
  return name
    .replace(PRINT_CARTRIDGE_LABEL_PATTERN, 'Toner Cartucho Original')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Mueve BK/CY/MG/YW al final del nombre como Negro/Cyan/Magenta/Amarillo. */
export function normalizeTonerColorProductName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const inlineMatch = trimmed.match(TONER_COLOR_CODE_PATTERN);
  if (!inlineMatch) return trimmed;

  const code = inlineMatch[1]!.toUpperCase() as TonerColorCode;
  const suffix = TONER_COLOR_CODE_LABELS[code];
  if (!suffix) return trimmed;

  let base = trimmed
    .replace(new RegExp(`\\s*\\b${code}\\b\\s*`, 'i'), ' ')
    .replace(TONER_COLOR_SUFFIX_PATTERN, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!base) return trimmed;

  return `${base} ${suffix}`.replace(/\s{2,}/g, ' ').trim();
}

/** Normaliza «SEMINUEVA» y añade el sufijo «220V» en equipos seminuevos. */
export function formatSeminuevaProductName(name: string): string {
  const trimmed = name.trim();
  if (!/\bseminueva\b/i.test(trimmed)) return trimmed;

  let result = trimmed.replace(/\bseminueva\b/gi, 'Seminueva');

  if (!/\b220\s*v\b/i.test(result)) {
    result = `${result} 220V`;
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

const YIELD_PAREN_PATTERN =
  /\((?:Rend\s+[^)]+|\d[\d,.\s]*5%-A4[^)]*)\)/i;

/**
 * Mueve bloques entre paréntesis al final del título (tras el sufijo de modelos).
 * Ej.: «Filtro (180,000 5%-A4) — IM-430F» → «Filtro — IM-430F (180,000 5%-A4)»
 */
export function moveParentheticalSuffixToEnd(name: string): string {
  const trimmed = name.trim();
  if (!YIELD_PAREN_PATTERN.test(trimmed)) return trimmed;

  const dashIdx = trimmed.indexOf(' — ');
  const head = dashIdx >= 0 ? trimmed.slice(0, dashIdx) : trimmed;
  const tail = dashIdx >= 0 ? trimmed.slice(dashIdx) : '';

  const parens: string[] = [];
  const base = head
    .replace(/\s*(\((?:Rend\s+[^)]+|\d[\d,.\s]*5%-A4[^)]*)\))/gi, (_, group: string) => {
      parens.push(group);
      return '';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (parens.length === 0) return trimmed;

  const parenSuffix = parens.join(' ');
  if (tail) {
    return `${base}${tail} ${parenSuffix}`.replace(/\s{2,}/g, ' ').trim();
  }
  return `${base} ${parenSuffix}`.replace(/\s{2,}/g, ' ').trim();
}

/** Nombre de inventario/tienda: paréntesis al final, color de tóner y reglas seminueva. */
export function formatInventoryProductName(name: string): string {
  return formatSeminuevaProductName(
    normalizeTonerColorProductName(
      moveParentheticalSuffixToEnd(normalizeTonerCartridgeProductLabel(name)),
    ),
  );
}

export function isSeminuevaProductName(name: string): boolean {
  return /\bseminueva\b/i.test(name.trim());
}

export function hasTonerColorCode(name: string): boolean {
  return TONER_COLOR_CODE_PATTERN.test(name.trim());
}
