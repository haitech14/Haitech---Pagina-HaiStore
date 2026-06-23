/** Modelos destacados al inicio de cada subsección B/N del catálogo por formato. */
export const CATALOG_FORMAT_BN_SUBSECTION_SPOTLIGHTS: Readonly<
  Record<'bn-a3' | 'bn-a4', readonly RegExp[]>
> = {
  'bn-a3': [/\bim\s*460\s*f\b/i],
  'bn-a4': [
    /\bim\s*430\s*f\b/i,
    /\bim\s*460\s*f\b/i,
    /\bim\s*550\s*f\b/i,
    /\bim\s*600\s*f\b/i,
    /\bmp\s*4054\b/i,
  ],
};

/**
 * Equipos A3 (u otro formato principal) que también deben mostrarse en «Formato A4»
 * como el mismo producto (mismo id), sin duplicar en inventario.
 */
export const CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS: readonly RegExp[] = [
  /\bim\s*430\s*f\b/i,
  /\bim\s*460\s*f\b/i,
];
