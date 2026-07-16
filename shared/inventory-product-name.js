/** Códigos de color Ricoh en cartuchos → sufijo legible. */
export const TONER_COLOR_CODE_LABELS = {
  BK: 'Negro',
  BLACK: 'Negro',
  CY: 'Cyan',
  CYAN: 'Cyan',
  MG: 'Magenta',
  MAGENTA: 'Magenta',
  YW: 'Amarillo',
  YELLOW: 'Amarillo',
};

const TONER_COLOR_CODE_PATTERN = /\b(BLACK|YELLOW|MAGENTA|CYAN|BK|CY|MG|YW)\b/i;
const TONER_COLOR_SUFFIX_PATTERN = /\s+(Negro|Cyan|Magenta|Amarillo|Yellow)\s*$/i;
const PRINT_CARTRIDGE_LABEL_PATTERN = /\bPRINT\s*CARTRIDGE\b|\bPRINT\s*CART\b/gi;

/** Sustituye «Print Cartridge» / «PRINT CART» por «Toner Cartucho Original RICOH». */
export function normalizeTonerCartridgeProductLabel(name) {
  return String(name ?? '')
    .replace(PRINT_CARTRIDGE_LABEL_PATTERN, 'Toner Cartucho Original RICOH')
    .replace(/\bToner Cartucho Original RICOH\s+RICOH\b/gi, 'Toner Cartucho Original RICOH')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Mueve BK/CY/MG/YW al final del nombre como Negro/Cyan/Magenta/Amarillo.
 * @param {string} name
 */
export function normalizeTonerColorProductName(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return trimmed;

  const inlineMatch = trimmed.match(TONER_COLOR_CODE_PATTERN);
  if (!inlineMatch) return trimmed;

  const code = inlineMatch[1].toUpperCase();
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

/** Normaliza «NUEVA» / «NUEVO» en equipos nuevos (no aplica si el título incluye «seminueva»). */
export function formatNuevaProductName(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed || /\bseminueva\b/i.test(trimmed)) return trimmed;

  return trimmed
    .replace(/\bNUEVA\b/g, 'Nueva')
    .replace(/\bNUEVO\b/g, 'Nuevo')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Normaliza «SEMINUEVA» y añade el sufijo «220V» en equipos seminuevos. */
export function formatSeminuevaProductName(name) {
  const trimmed = String(name ?? '').trim();
  if (!/\bseminueva\b/i.test(trimmed)) return trimmed;

  let result = trimmed.replace(/\bseminueva\b/gi, 'Seminueva');

  if (!/\b220\s*v\b/i.test(result)) {
    result = `${result} 220V`;
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

const YIELD_PAREN_PATTERN =
  /\((?:Rend\s+[^)]+|\d[\d,.\s]*5%-A4[^)]*)\)/i;

const XREF_PREFIX_PATTERN = /^\s*\[xref\s+to\s+[^\]]+\]\s*/i;
const XREF_CAPTURE_PATTERN = /^\s*\[xref\s+to\s+([^\]]+)\]\s*/i;
const GRAMAJE_LEADING_PATTERN =
  /^(\d+(?:[.,]\d+)?\s*(?:ML|ml|G|g|KG|kg|GR|gr|L|l))\s*[—–-]\s+(.+)$/i;

/**
 * Extrae el código de un prefijo «[XREF TO CODIGO]».
 * @param {string} name
 */
export function extractXrefToCode(name) {
  const match = String(name ?? '').match(XREF_CAPTURE_PATTERN);
  const code = match?.[1]?.trim();
  return code || null;
}

/**
 * Une códigos con « / » sin duplicar.
 * @param {string | null | undefined} primary
 * @param {string | null | undefined} extra
 */
export function mergeProductCodesWithSlash(primary, extra) {
  const a = String(primary ?? '').trim();
  const b = String(extra ?? '').trim();
  if (!b) return a;
  if (!a) return b;
  const parts = a
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.some((part) => part.toUpperCase() === b.toUpperCase())) {
    return parts.join(' / ');
  }
  return [...parts, b].join(' / ');
}

/**
 * Elimina el marcador Ricoh «EXP» (export) del nombre.
 * @param {string} name
 */
export function stripExpProductMarker(name) {
  return String(name ?? '')
    .replace(/:EXP\b/gi, '')
    .replace(/(^|[\s(/—–-])EXP(?=[\s)/—–-]|$)/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .replace(/:\s*(?=[A-Z0-9(])/g, ':')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

/**
 * Si PCDU o PCU aparecen más de una vez, conserva solo la primera aparición.
 * @param {string} name
 */
export function dedupePcduPcuAcronyms(name) {
  let result = String(name ?? '');
  for (const acronym of ['PCDU', 'PCU']) {
    let seen = false;
    const re = new RegExp(`\\(?\\b${acronym}\\b\\)?`, 'gi');
    result = result.replace(re, (match) => {
      if (!seen) {
        seen = true;
        return match;
      }
      return '';
    });
  }
  return result
    .replace(/\(\s*\/\s*/g, '(')
    .replace(/\s*\/\s*\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\/\s+/g, ' / ')
    .trim();
}

/** Elimina prefijos de referencia cruzada del inventario Ricoh LP. */
export function stripXrefProductNamePrefix(name) {
  let result = String(name ?? '').trim();
  while (XREF_PREFIX_PATTERN.test(result)) {
    result = result.replace(XREF_PREFIX_PATTERN, '').trim();
  }
  return result;
}

/**
 * Quita «[XREF TO CODIGO]» del nombre, une el código con « / »,
 * elimina EXP y deduplica PCDU/PCU.
 * @param {{ name?: string | null, code?: string | null }} input
 */
export function resolveXrefProductFields(input = {}) {
  const rawName = String(input.name ?? '').trim();
  const xrefCode = extractXrefToCode(rawName);
  let nextName = stripXrefProductNamePrefix(rawName);
  nextName = stripExpProductMarker(nextName);
  nextName = dedupePcduPcuAcronyms(nextName);
  const nextCode = xrefCode
    ? mergeProductCodesWithSlash(input.code, xrefCode)
    : String(input.code ?? '').trim();
  return {
    name: nextName,
    code: nextCode,
    xrefCode,
  };
}

/** Prefijo legible para unidades PCDU / PCU en repuestos Ricoh. */
export function applySparePartUnitPrefix(name) {
  const trimmed = String(name ?? '').trim();
  if (!trimmed) return trimmed;

  if (/PCDU/i.test(trimmed)) {
    if (/unidad de imagen \+ unidad de revelado original/i.test(trimmed)) {
      return trimmed;
    }
    return `Unidad de imagen + Unidad de Revelado Original — ${trimmed}`;
  }

  if (/\bPCU\b|PCU:/i.test(trimmed)) {
    if (/unidad de imagen\/cilindro original/i.test(trimmed)) {
      return trimmed;
    }
    return `Unidad de Imagen/Cilindro Original — ${trimmed}`;
  }

  return trimmed;
}

/** Mueve gramaje/volumen inicial al final (p. ej. «600 ML — PRO-L5160e Cyan»). */
export function moveGramajeToSuffix(name) {
  const trimmed = String(name ?? '').trim();
  const match = trimmed.match(GRAMAJE_LEADING_PATTERN);
  if (!match?.[1] || !match[2]) return trimmed;
  return `${match[2].trim()} — ${match[1].trim()}`;
}

/** Mueve segmentos «Rend …» al final del título. */
export function moveRendSegmentsToSuffix(name) {
  const trimmed = String(name ?? '').trim();
  /** @type {string[]} */
  const rendSegments = [];

  let result = trimmed
    .replace(/\s*[—–-]\s*Rend\s+([^—–-]+?)(?=\s*[—–-]|$)/gi, (_, segment) => {
      rendSegments.push(`Rend ${segment.trim()}`);
      return '';
    })
    .replace(/\s*\(Rend\s+([^)]+)\)/gi, (_, segment) => {
      rendSegments.push(`Rend ${segment.trim()}`);
      return '';
    });

  result = result
    .replace(/\s*[—–-]\s*[—–-]+/g, ' — ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (rendSegments.length === 0) return trimmed;

  return `${result} — ${rendSegments.join(' — ')}`.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Mueve bloques entre paréntesis al final del título (tras el sufijo de modelos).
 * Ej.: «Filtro (180,000 5%-A4) — IM-430F» → «Filtro — IM-430F (180,000 5%-A4)»
 * @param {string} name
 */
export function moveParentheticalSuffixToEnd(name) {
  const trimmed = String(name ?? '').trim();
  if (!YIELD_PAREN_PATTERN.test(trimmed)) return trimmed;

  const dashIdx = trimmed.indexOf(' — ');
  const head = dashIdx >= 0 ? trimmed.slice(0, dashIdx) : trimmed;
  const tail = dashIdx >= 0 ? trimmed.slice(dashIdx) : '';

  /** @type {string[]} */
  const parens = [];
  const base = head
    .replace(/\s*(\((?:Rend\s+[^)]+|\d[\d,.\s]*5%-A4[^)]*)\))/gi, (_, group) => {
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

/** Nombre de inventario/tienda: xref, PCDU/PCU, rendimiento, gramaje, color, nueva y seminueva. */
export function formatInventoryProductName(name) {
  const resolved = resolveXrefProductFields({ name });
  return formatSeminuevaProductName(
    formatNuevaProductName(
      normalizeTonerColorProductName(
        moveParentheticalSuffixToEnd(
          moveRendSegmentsToSuffix(
            moveGramajeToSuffix(
              dedupePcduPcuAcronyms(
                applySparePartUnitPrefix(normalizeTonerCartridgeProductLabel(resolved.name)),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

export function isSeminuevaProductName(name) {
  return /\bseminueva\b/i.test(String(name ?? '').trim());
}

/** Equipo nuevo en inventario: «NUEVA» / «NUEVO» en el nombre y sin «seminueva». */
export function productQualifiesAsNuevaEquipment(product) {
  const name = String(product?.name ?? '').trim();
  if (!name) return false;
  if (isSeminuevaProductName(name)) return false;
  if (/\bremanufacturad/i.test(name)) return false;
  return /\bnueva\b/i.test(name) || /\bnuevo\b/i.test(name);
}

/** Equipo seminuevo: «seminueva» en el nombre o categoría de seminuevas. */
export function productQualifiesAsSeminuevaEquipment(product) {
  const name = String(product?.name ?? '').trim();
  if (isSeminuevaProductName(name)) return true;
  const category = String(product?.category ?? '').toLowerCase();
  return category.includes('seminuevas');
}

export function isRemanufacturadaProductName(name) {
  return /\bremanufacturad/i.test(String(name ?? '').trim());
}

/** Equipo remanufacturado: «remanufacturad» en el nombre o categoría de remanufacturadas. */
export function productQualifiesAsRemanufacturadaEquipment(product) {
  const name = String(product?.name ?? '').trim();
  if (isSeminuevaProductName(name)) return false;
  if (isRemanufacturadaProductName(name)) return true;
  if (productQualifiesAsNuevaEquipment(product)) return false;
  const category = String(product?.category ?? '').toLowerCase();
  if (category.includes('seminuevas')) return false;
  return category.includes('remanufacturadas') || category.includes('remanufacturados');
}

export function hasTonerColorCode(name) {
  return TONER_COLOR_CODE_PATTERN.test(String(name ?? '').trim());
}
