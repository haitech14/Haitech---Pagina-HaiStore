/** Catálogo guillotinas 4B Office (jun 2026). */

/**
 * @param {string} code
 */
export function extractGuillotinaModel(code) {
  const match = String(code ?? '').match(/^A-(.+)$/);
  return match?.[1] ?? String(code ?? '').trim();
}

/**
 * @param {{ model: string; format: string }} input
 */
export function buildGuillotinaProductName({ model, format }) {
  return `Guillotina 4B Office ${model} de ${format}`;
}

export const OFFICE_4B_GUILLOTINAS_CATALOG = [
  {
    slug: 'gta4-negro',
    code: 'A-GTA4/NEGRO',
    model: 'GTA4',
    format: 'A4',
    color: 'Negra',
    cajon: '5 unidades',
    brand: '4B Office',
    productImageId: '9d8ea80d',
    title: 'GUILLOTINA A4 - NEGRA',
    shortDescription:
      'Guillotina manual formato A4 color negra. Código de sistema A-GTA4/NEGRO. Cajón: 5 unidades.',
  },
  {
    slug: 'gta3-negro',
    code: 'A-GTA3/NEGRO',
    model: 'GTA3',
    format: 'A3',
    color: 'Negra',
    cajon: '10 unidades',
    brand: '4B Office',
    productImageId: 'fe6d540f',
    title: 'GUILLOTINA A3 - NEGRA',
    shortDescription:
      'Guillotina manual formato A3 color negra. Código de sistema A-GTA3/NEGRO. Cajón: 10 unidades. Formatos en base: A3, A4, B5, A5, B6, B7.',
  },
];
