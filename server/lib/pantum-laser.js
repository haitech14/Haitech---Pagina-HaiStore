export const CATEGORY_PANTUM_LASER_NUEVAS = 'Impresoras, Impresoras Laser Nuevas';

export const PANTUM_BRAND = 'Pantum';

export const PANTUM_LASER_INTRO =
  'Este equipo fácil de usar tiene impresión de alta velocidad y a doble cara, ofreciendo excelente calidad y un manejo de papel eficiente. Gracias a su interfaz intuitiva, rendimiento estable y seguridad confiable, junto con herramientas opcionales flexibles, permite trabajar de forma más práctica, ahorrando tiempo y recursos en el día a día.';

/**
 * @param {{ model: string; colorMode?: 'bn' | 'color'; format?: 'A4' | 'A3' }} input
 */
export function buildPantumLaserName({ model, colorMode = 'bn', format = 'A4' }) {
  const tone = colorMode === 'color' ? 'Color' : 'B/N';
  return `Impresoras Laser ${tone} ${format} Nueva Pantum ${model}`;
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
 *   intro?: string;
 * }} entry
 */
export function buildPantumLaserDescription(entry) {
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
  return lines.join('\n');
}
