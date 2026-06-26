export const CATEGORY_PANTUM_TERMICA_NUEVAS = 'Impresoras, Impresoras Nuevas';

export const PANTUM_BRAND = 'Pantum';

export const PANTUM_TERMICA_INTRO =
  'Impresora térmica de recibos diseñada para quienes no pueden permitirse detenerse. Combinando una velocidad asombrosa con una durabilidad de grado industrial, esta unidad es la solución definitiva para sectores que exigen precisión bajo presión. Diseño resistente al agua y al polvo con clasificación IP54.';

/**
 * @param {{ model: string }} input
 */
export function buildPantumTermicaName({ model }) {
  return `Impresora Termica de 72mm Nueva Pantum ${model}`;
}

/**
 * @param {{
 *   specs: {
 *     resolution?: string;
 *     printSpeed?: string;
 *     printWidth?: string;
 *     memory?: string;
 *     storage?: string;
 *     features?: string[];
 *   };
 *   connectivity?: string;
 *   intro?: string;
 * }} entry
 */
export function buildPantumTermicaDescription(entry) {
  const lines = [];
  if (entry.intro) lines.push(entry.intro);
  if (entry.specs.resolution) lines.push(`Resolución: ${entry.specs.resolution}`);
  if (entry.specs.printSpeed) lines.push(`Velocidad de impresión: ${entry.specs.printSpeed}`);
  if (entry.specs.printWidth) lines.push(`Ancho de impresión: ${entry.specs.printWidth}`);
  if (entry.specs.memory) lines.push(`RAM: ${entry.specs.memory}`);
  if (entry.specs.storage) lines.push(`Almacenamiento: ${entry.specs.storage}`);
  if (entry.connectivity) lines.push(`Conectividad: ${entry.connectivity}`);
  for (const feature of entry.specs.features ?? []) {
    lines.push(feature);
  }
  return lines.join('\n');
}
