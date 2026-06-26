/** Catálogo anilladoras 4B Office (jun 2026). */

/**
 * @param {string} code
 */
export function extractAnilladoraModel(code) {
  const match = String(code ?? '').match(/^A-(.+?)(?:-4B|\/4B)$/);
  return match?.[1] ?? String(code ?? '').trim();
}

/**
 * @param {{ code: string; perforadoMax: number; format: string }} input
 */
export function buildAnilladoraProductName({ code, perforadoMax, format }) {
  const model = extractAnilladoraModel(code);
  return `Anilladora 4B Office ${model} de ${perforadoMax} ${format}`;
}

export const OFFICE_4B_ANILLADORAS_CATALOG = [
  {
    slug: 'an12hj',
    code: 'A-AN12HJ-4B',
    perforadoMax: 15,
    format: 'A4/B5/Carta/A5',
    cajon: '4 unidades',
    brand: '4B Office',
    productImageId: '45fd0510',
    productSide: 'left',
    shortDescription: `Perforado Max. (70-80g Págs): 15
Encuadernado Max. (70-80g Págs): 120 (4.8mm-14.3mm wire ring)
Formato: A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 34 (pc)
Distancia de agujero: 8.47 (mm)
Tamaño de agujero: 4 x 4 (mm)
N.W./G.W/CTN: 24/26 (kg)
CBM/CTN: 0.103m³ (4pcs/ctn)`,
  },
  {
    slug: 'an20hj-p3',
    code: 'A-AN20HJ-P:3-1/4B',
    perforadoMax: 20,
    format: 'A4/B5/Carta/A5',
    cajon: '2 unidades',
    brand: '4B Office',
    productImageId: '5a3b16f6',
    productSide: 'left',
    shortDescription: `Perforado Max. (70-80g Págs): 20
Encuadernado Max. (70-80g Págs): 120 (4.8mm-14.3mm wire ring)
Formato: A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 34 (pc)
Distancia de agujero: 8.47 (mm)
Tamaño de agujero: 4 x 4 (mm)
N.W./G.W/CTN: 22/24 (kg)
CBM/CTN: 0.097m³ (2pcs/ctn)`,
  },
  {
    slug: 'an25hj-p2',
    code: 'A-AN25HJ-P2:1/4B',
    perforadoMax: 25,
    format: 'F4/A4/B5/Carta/A5',
    cajon: '1 unidad',
    brand: '4B Office',
    productImageId: 'c85a404d',
    productSide: 'left',
    shortDescription: `Perforado Max. (70-80g Págs): 25
Encuadernado Max. (70-80g Págs): 250 (15.9mm-25.4mm P2:1 wire ring)
Formato: F4/A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 27 (F4 330 pc)
Distancia de agujero: 12.7 (mm)
Tamaño de agujero: 4 x 5.5 (mm)
N.W./G.W/CTN: 17/18 (kg)
CBM/CTN: 0.065m³ (1 pcs/ctn)`,
  },
  {
    slug: 'an25hj-pe',
    code: 'A-AN25HJ/PE-4B',
    perforadoMax: 25,
    format: 'F4/A4/B5/Carta/A5',
    cajon: '1 unidad',
    brand: '4B Office',
    productImageId: '76d094e8',
    productSide: 'right',
    shortDescription: `Perforado Max. (70-80g Págs): 25
Encuadernado Max. (70-80g Págs): 120 (4.8 - 14.3 mm wire ring)
Tipo de encuadernado: 250 (15.9-25.4 mm wire ring)
Formato: F4/A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 40 (wire P3:1) / 27 (wire P2:1)
Distancia de agujero: 8.47 (wire P3:1) / 12.7 (wire P2:1)
N.W./G.W/CTN: 26/28 (kg)
CBM/CTN: 0.123 m³ (1 pcs/ctn)`,
  },
];
