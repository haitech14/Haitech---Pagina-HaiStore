export { CANON_BRAND, CATEGORY_CANON_MF_NUEVAS } from './canon-multifuncionales.js';

export const CANON_IMAGEFORCE_MARKETING_OLED =
  'Imprime documentos de calidad superior con una resolución de impresión de 4800 x 2400 ppp gracias a nuestra exclusiva e innovadora tecnología de impresión OLED.';

export const CANON_IMAGEFORCE_MARKETING_WORKFLOW =
  'Ideal para empresas que buscan proteger y optimizar sus procesos digitales y flujos de trabajo de documentos.';

export const CANON_IMAGEFORCE_RESOLUTION = '4800 x 2400 ppp';

/**
 * @param {{ model: string }} input
 */
export function buildCanonImageForceName({ model }) {
  return `Impresoras Multifuncionales Nuevas OLED a Color ImageForce ${model}`;
}

/**
 * @param {{
 *   specs: {
 *     speed: string;
 *     rendimiento: string;
 *     scanSpeed?: string;
 *     memory?: string;
 *     storage?: string;
 *     adf?: string;
 *     paper?: string;
 *   };
 * }} entry
 */
export function buildCanonImageForceDescription(entry) {
  const lines = [
    CANON_IMAGEFORCE_MARKETING_OLED,
    CANON_IMAGEFORCE_MARKETING_WORKFLOW,
    `Velocidad: ${entry.specs.speed}`,
    `Rendimiento: ${entry.specs.rendimiento}`,
  ];

  if (entry.specs.scanSpeed) lines.push(`Velocidad escáner: ${entry.specs.scanSpeed}`);
  if (entry.specs.memory) lines.push(`Memoria RAM: ${entry.specs.memory}`);
  if (entry.specs.storage) lines.push(`Almacenamiento: ${entry.specs.storage}`);
  if (entry.specs.adf) lines.push(`ADF: ${entry.specs.adf}`);
  if (entry.specs.paper) lines.push(`Capacidad papel: ${entry.specs.paper}`);
  lines.push(`Resolución: ${CANON_IMAGEFORCE_RESOLUTION}`);

  return lines.join('\n');
}
