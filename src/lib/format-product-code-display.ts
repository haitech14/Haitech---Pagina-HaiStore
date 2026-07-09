/** Longitud a partir de la cual un código de un solo segmento se trunca solo con CSS. */
export const PRODUCT_CODE_CARD_DISPLAY_MIN_LENGTH = 12;

/**
 * Abrevia códigos largos para tarjetas: primer segmento + guion + 2 letras del segundo + «…».
 * Ej. `418843-CP8Y1I-CPO800-CPQE4C` → `418843-CP…`
 * Códigos cortos o de un solo segmento se devuelven tal cual (ellipsis CSS en la tarjeta).
 */
export function formatProductCodeCardDisplay(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return trimmed;

  const segments = trimmed.split('-');
  const isLong =
    trimmed.length > PRODUCT_CODE_CARD_DISPLAY_MIN_LENGTH || segments.length > 2;

  if (!isLong || segments.length < 2) {
    return trimmed;
  }

  const [first, second] = segments;
  if (!first) return trimmed;

  const prefix = (second ?? '').slice(0, 2);
  return prefix ? `${first}-${prefix}…` : `${first}…`;
}
