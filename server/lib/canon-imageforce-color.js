export { CANON_BRAND, CATEGORY_CANON_MF_NUEVAS } from './canon-multifuncionales.js';

export const CANON_IMAGEFORCE_COLOR_INTRO =
  'Diseñados para ayudar a oficinas con gran volumen de trabajo y grupos de trabajo grandes.';

export const CANON_IMAGEFORCE_COLOR_BULLETS = [
  'Escanea en alta velocidad e imprime grandes volúmenes, así como una gran capacidad de papel y diferentes opciones de acabado.',
  'Ofrece una gama de soluciones basadas en software y MEAP para la impresión desde dispositivos móviles o dispositivos conectados a Internet',
];

/**
 * @param {{ model: string }} input
 */
export function buildCanonImageForceColorName({ model }) {
  return `Impresoras Multifuncionales a Color ImageForce ${model}`;
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
export function buildCanonImageForceColorDescription(entry) {
  const lines = [
    CANON_IMAGEFORCE_COLOR_INTRO,
    ...CANON_IMAGEFORCE_COLOR_BULLETS,
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
