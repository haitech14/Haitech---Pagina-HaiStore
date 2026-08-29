/**
 * COD-PART de equipos nuevos (lista comercial Ricoh).
 * Seminuevos: mismo código con sufijo -SN.
 */
export const HAITECH_EQUIPMENT_PART_CODES: Readonly<Record<string, string>> = {
  'P 502': '418495',
  'P 801': '418474',
  'P 800': '418471',
  'IM 430F': '418491',
  'IM 460F': '423509',
  'IM 550F': '418460',
  'IM 600F': '418464',
  'IM 2500': '418843',
  'IM 3000': '418844',
  'IM 4000': '418846',
  'IM 5000': '418847',
  'IM 8000': '418782',
  'IM 9000': '418787',
  'IM 6010': '423796',
  'IM C401F': '423693',
  'IM C320F': '418787',
  'IM C2010': '419346',
  'IM C4510': '418843',
  'IM C6010': '418843',
  'PRO C5300': '409392',
  'PRO C5300S': '409392',
};

function normalizeModelKey(model: string): string {
  return model.replace(/\s+/g, ' ').trim().toUpperCase();
}

/** Extrae modelo Ricoh desde el nombre del producto. */
export function extractEquipmentModelKey(name: string): string | null {
  const patterns = [
    /\bPRO\s+C\s*5300S?\b/i,
    /\bIM\s+C\s*\d{4}[A-Z]?\b/i,
    /\bIM\s+\d{4}[A-Z]?\b/i,
    /\bMP\s+C?\s*\d{4}\b/i,
    /\bM\s+C\s*\d{3,4}[A-Z]{0,3}\b/i,
    /\bM\s+\d{3,4}[A-Z]?\b/i,
    /\bSP\s+\d{4}[A-Z]{0,4}\b/i,
    /\bP\s+\d{3,4}\b/i,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) return normalizeModelKey(match[0]);
  }
  return null;
}

function partCodeFromRawCode(code: string): string | null {
  const trimmed = code.trim();
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  const prefix = trimmed.split('-')[0];
  if (prefix && /^\d{6}$/.test(prefix)) return prefix;
  return null;
}

/** Código para vitrina / card: parte numérica; seminuevo → -SN. */
export function resolveEquipmentShowcaseCode(input: {
  name: string;
  code?: string | null;
  condition?: string | null;
}): string | null {
  const model = extractEquipmentModelKey(input.name);
  let base = model ? HAITECH_EQUIPMENT_PART_CODES[model] : undefined;

  if (!base && input.code) {
    base = partCodeFromRawCode(input.code) ?? undefined;
  }

  if (!base) {
    const raw = input.code?.trim();
    return raw || null;
  }

  if (input.condition === 'seminuevo') return `${base}-SN`;
  return base;
}
