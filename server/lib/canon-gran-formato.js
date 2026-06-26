export { CANON_BRAND, CATEGORY_CANON_MF_NUEVAS as CATEGORY_CANON_GRAN_FORMATO_NUEVAS } from './canon-multifuncionales.js';

export const CANON_GRAN_FORMATO_FEATURES = [
  'Color de alto impacto: Nueva tinta magenta',
  'Nitidez técnica: Precisión en líneas y textos, ideal para planos CAD y dibujos lineales detallados.',
  'Gestión inteligente de papel: Sensores que detectan automáticamente tipo y tamaño del papel, con estimación del metraje restante.',
  'Flexibilidad de carga: Soporte para unidad de doble rodillo opcional (alimentación automática o recogida de impresiones).',
  'Control avanzado (MFP): Pantalla táctil de 15.6" que permite editar, recortar y enderezar escaneos directamente en el equipo.',
];

/**
 * @param {{ model: string }} input
 */
export function buildCanonGranFormatoName({ model }) {
  return `Impresoras Gran Formato A1 B/N Canon ${model}`;
}

/**
 * @param {{
 *   variant: 'plotter' | 'mfp';
 *   specs: {
 *     speed?: string;
 *     resolution?: string;
 *     ink?: string;
 *     scanWidth?: string;
 *     scanSoftware?: string;
 *     scanSpeed?: string;
 *   };
 * }} entry
 */
export function buildCanonGranFormatoDescription(entry) {
  const lines = [...CANON_GRAN_FORMATO_FEATURES, ''];

  if (entry.variant === 'plotter') {
    if (entry.specs.speed) lines.push(`Velocidad: ${entry.specs.speed}`);
    if (entry.specs.resolution) lines.push(`Resolución: ${entry.specs.resolution}`);
    if (entry.specs.ink) lines.push(`Tinta 5 colores: ${entry.specs.ink}`);
  } else {
    if (entry.specs.resolution) lines.push(`Resolución: ${entry.specs.resolution}`);
    if (entry.specs.scanWidth) lines.push(`Ancho escaneo: ${entry.specs.scanWidth}`);
    if (entry.specs.scanSoftware) lines.push(`Software: ${entry.specs.scanSoftware}`);
    if (entry.specs.scanSpeed) lines.push(`Velocidad escaneo: ${entry.specs.scanSpeed}`);
  }

  return lines.join('\n');
}

/**
 * @param {'plotter' | 'mfp'} variant
 */
export function canonGranFormatoTechnology(variant) {
  return variant === 'mfp' ? 'Gran formato / MFP' : 'Gran formato / Plotter';
}
