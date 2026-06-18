const DISPLAY_CODE_PREFIX_PATTERNS = [/^REPUESTO/i, /^RICOH/i] as const;

/** Quita prefijos de marca/tipo del código solo para mostrar (no altera el valor guardado). */
export function stripProductCodeDisplayPrefix(code: string): string {
  let result = code.trim();
  if (!result) return result;

  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of DISPLAY_CODE_PREFIX_PATTERNS) {
      const next = result.replace(pattern, '').trim();
      if (next !== result) {
        result = next;
        changed = true;
      }
    }
  }

  return result || code.trim();
}

/**
 * Código listo para UI: sin prefijos REPUESTO/RICOH ni marca duplicada al inicio.
 * La búsqueda sigue usando el código crudo del inventario.
 */
export function formatProductDisplayCode(
  code: string | null | undefined,
  options: { brand?: string | null | undefined } = {},
): string | null {
  const raw = code?.trim();
  if (!raw) return null;

  let cleaned = stripProductCodeDisplayPrefix(raw);

  const brand = options.brand?.trim();
  if (brand) {
    const brandUpper = brand.toUpperCase();
    if (cleaned.toUpperCase().startsWith(brandUpper)) {
      cleaned = cleaned.slice(brand.length).trim();
    }
  }

  return cleaned || raw;
}
