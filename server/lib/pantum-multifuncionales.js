export const CATEGORY_PANTUM_MF_NUEVAS = 'Multifuncionales, Multifuncionales Nuevas';

export const PANTUM_BRAND = 'Pantum';

export const PANTUM_MF_INTRO =
  'Este equipo fácil de usar integra funciones de impresión, copiado y escaneo, ofreciendo excelente calidad y un manejo de papel eficiente. Gracias a su interfaz intuitiva, rendimiento estable y seguridad confiable, junto con herramientas opcionales flexibles, permite trabajar de forma más práctica, ahorrando tiempo y recursos en el día a día.';

/**
 * @param {{ model: string; colorMode: 'bn' | 'color'; format?: 'A4' | 'A3' }} input
 */
export function buildPantumMultifuncionalName({ model, colorMode, format = 'A4' }) {
  const tone = colorMode === 'color' ? 'Color' : 'B/N';
  return `Impresoras Multifuncionales ${tone} ${format} Nueva Pantum ${model}`;
}

/**
 * @param {{
 *   specs: {
 *     speed?: string;
 *     monthlyVolume?: string;
 *     memory?: string;
 *     storage?: string;
 *     paper?: string;
 *     paperOutput?: string;
 *     paperWeight?: string;
 *     features?: string[];
 *   };
 *   connectivity?: string;
 *   starterToner?: boolean;
 *   intro?: string;
 * }} entry
 */
export function buildPantumMultifuncionalDescription(entry) {
  const lines = [];
  if (entry.intro) lines.push(entry.intro);
  if (entry.specs.speed) lines.push(`Velocidad: ${entry.specs.speed}`);
  if (entry.specs.monthlyVolume) lines.push(`Volumen mensual: ${entry.specs.monthlyVolume}`);
  if (entry.specs.memory) lines.push(`Memoria: ${entry.specs.memory}`);
  if (entry.specs.storage) lines.push(`Almacenamiento: ${entry.specs.storage}`);
  if (entry.specs.paperOutput) lines.push(`Salida de papel: ${entry.specs.paperOutput}`);
  if (entry.specs.paperWeight) lines.push(`Peso papel: ${entry.specs.paperWeight}`);
  if (entry.specs.paper) lines.push(`Capacidad de papel: ${entry.specs.paper}`);
  if (entry.connectivity) lines.push(`Conectividad: ${entry.connectivity}`);
  for (const feature of entry.specs.features ?? []) {
    lines.push(feature);
  }
  if (entry.starterToner) lines.push('Incluye tóner de inicio.');
  return lines.join('\n');
}

/**
 * @param {string | undefined} paper
 */
export function extractAdfFromPaper(paper) {
  const match = String(paper ?? '').match(/ADF:\s*([^,]+)/i);
  return match?.[1]?.trim() ?? '';
}
