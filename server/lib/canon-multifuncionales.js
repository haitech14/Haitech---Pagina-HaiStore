export const CATEGORY_CANON_MF_NUEVAS = 'Multifuncionales, Multifuncionales Nuevas';

export const CANON_BRAND = 'Canon';

export const CANON_MF_INTRO =
  'Clientes que necesitan una impresión en blanco y negro rápida y fiable. Satisface las necesidades de medio a alto volumen de entornos empresariales, hospitalarios, escuelas y entidades jurídicas';

/**
 * @param {{ model: string }} input
 */
export function buildCanonMultifuncionalName({ model }) {
  return `Impresoras multifuncionales A3 B/N Canon ${model}`;
}

/**
 * @param {{
 *   intro?: string;
 *   specs: {
 *     speed?: string;
 *     monthlyVolume?: string;
 *     memory?: string;
 *     storage?: string;
 *     touchPanel?: string;
 *     scan?: string;
 *     adf?: string;
 *     paper?: string;
 *     toner?: string;
 *   };
 * }} entry
 */
export function buildCanonMultifuncionalDescription(entry) {
  const lines = [];
  if (entry.intro) lines.push(entry.intro);
  if (entry.specs.speed) lines.push(`Velocidad: ${entry.specs.speed}`);
  if (entry.specs.monthlyVolume) lines.push(`Volumen mensual: ${entry.specs.monthlyVolume}`);
  if (entry.specs.memory) lines.push(`Memoria RAM: ${entry.specs.memory}`);
  if (entry.specs.storage) lines.push(`Almacenamiento: ${entry.specs.storage}`);
  if (entry.specs.touchPanel) lines.push(`Panel táctil: ${entry.specs.touchPanel}`);
  if (entry.specs.scan) lines.push(`Escaneo: ${entry.specs.scan}`);
  if (entry.specs.adf) lines.push(`ADF: ${entry.specs.adf}`);
  if (entry.specs.paper) lines.push(`Capacidad papel: ${entry.specs.paper}`);
  if (entry.specs.toner) lines.push(entry.specs.toner);
  return lines.join('\n');
}
