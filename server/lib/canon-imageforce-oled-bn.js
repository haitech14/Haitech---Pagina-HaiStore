export { CANON_BRAND, CATEGORY_CANON_MF_NUEVAS } from './canon-multifuncionales.js';

export const CANON_IMAGEFORCE_OLED_BN_INTRO =
  'Ideal para empresas medianas y grandes que demandan alta productividad, máxima seguridad y eficiencia en entornos profesionales exigentes.';

export const CANON_IMAGEFORCE_OLED_BN_AI =
  'Equipada con sensores inteligentes conectados y con algoritmos de mantenimiento predictivo que utilizan IA de aprendizaje automático para predecir la vida útil de las piezas y minimizar el tiempo de inactividad.';

/**
 * @param {{ model: string }} input
 */
export function buildCanonImageForceOledBnName({ model }) {
  return `Impresoras Multifuncionales OLED B/N ImageForce ${model}`;
}

/**
 * @param {{
 *   introLines?: string[];
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
export function buildCanonImageForceOledBnDescription(entry) {
  const introLines = entry.introLines ?? [
    CANON_IMAGEFORCE_OLED_BN_INTRO,
    CANON_IMAGEFORCE_OLED_BN_AI,
  ];

  const lines = [
    ...introLines,
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
