export { CANON_BRAND, CATEGORY_CANON_MF_NUEVAS } from './canon-multifuncionales.js';

export const CANON_IMAGEFORCE_BN_INTRO =
  'Diseñados para ayudar a oficinas con gran volumen de trabajo que buscan productividad y flexibilidad en cada proceso.';

/**
 * @param {{ model: string }} input
 */
export function buildCanonImageForceBnName({ model }) {
  return `Impresoras Multifuncionales B/N ImageForce ${model}`;
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
export function buildCanonImageForceBnDescription(entry) {
  const lines = [
    CANON_IMAGEFORCE_BN_INTRO,
    `Velocidad: ${entry.specs.speed}`,
    `Rendimiento: ${entry.specs.rendimiento}`,
  ];

  if (entry.specs.scanSpeed) lines.push(`Velocidad escáner: ${entry.specs.scanSpeed}`);
  if (entry.specs.memory) lines.push(`Memoria RAM: ${entry.specs.memory}`);
  if (entry.specs.storage) lines.push(`Almacenamiento: ${entry.specs.storage}`);
  if (entry.specs.adf) lines.push(`ADF: ${entry.specs.adf}`);
  if (entry.specs.paper) lines.push(`Capacidad papel: ${entry.specs.paper}`);

  return lines.join('\n');
}
