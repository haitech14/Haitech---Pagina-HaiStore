/** Catálogo espiraladoras 4B Office (jun 2026). */
export const OFFICE_4B_ESPIRALADORAS_CATALOG = [
  {
    slug: 'esp12hj',
    code: 'A-ESP12HJ-4B',
    model: 'ESP12HJ',
    sheets: 12,
    format: 'A4/Carta',
    cajon: '4 unidades',
    brand: '4B Office',
    productImageId: '1158be8c',
    specsImageId: 'e4381a06',
    shortDescription: `Perforado Max. (70-80g Págs): 12
Encuadernado Max. (70-80g Págs): Arbitrario
Tipo de encuadernado: Manual
Formato: A4/Carta
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 46 (pc)
Distancia de agujero: 6.35/6.29 (mm)
Tamaño de agujero: 4 (mm)
N.W./G.W./CTN: 18/21 (kg)
CBM/CTN: 0.103 m³ (2 pcs/ctn)`,
  },
  {
    slug: 'esp15hj',
    code: 'A-ESP15HJ-4B',
    model: 'ESP15HJ',
    sheets: 15,
    format: 'A4/B5/Carta/A5',
    cajon: '2 unidades',
    brand: '4B Office',
    productImageId: '807a2a5e',
    shortDescription: `Perforado Max. (70-80g Págs): 15
Encuadernado Max. (70-80g Págs): Arbitrario
Tipo de encuadernado: Manual
Formato: A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 54 (pc)
Distancia de agujero: 6 (mm)
Tamaño de agujero: 4 (mm)
N.W./G.W/CTN: 9.0/20 (kg)
CBM/CTN: 0.08 m³ (2 pcs/ctn)`,
  },
  {
    slug: 'esp20h',
    code: 'A-ESP20H-4B',
    model: 'ESP20H',
    sheets: 25,
    format: 'A4/Carta',
    cajon: '2 unidades',
    brand: '4B Office',
    productImageId: '758bd336',
    shortDescription: `Perforado Max. (70-80g Págs): 25
Encuadernado Max. (70-80g Págs): Arbitrario
Tipo de encuadernado: Manual
Formato: A4/Carta
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 46 (pc)
Distancia de agujero: 6.35 (mm)
Tamaño de agujero: 4 Ø (mm)
N.W./G.W/CTN: 17/19 (kg)
CBM/CTN: 0.097 m³ (2 pcs/ctn)`,
  },
  {
    slug: 'esp25hj-tf',
    code: 'A-ESP25HJ-TF-4B',
    model: 'ESP25HJ-TF',
    sheets: 25,
    format: 'A4/B5/A5',
    cajon: '2 unidades',
    brand: '4B Office',
    productImageId: '129a32b3',
    shortDescription: `Perforado Max. (70-80g Págs): 25
Encuadernado Max. (70-80g Págs): Arbitrario
Tipo de encuadernado: Eléctrico
Formato: A4/B5/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 46 (pc)
Distancia de agujero: 6.35 - 6.29 (mm)
Tamaño de agujero: 4 - 4x5 Ø (mm)
N.W./G.W/CTN: 24/26 (kg)
CBM/CTN: 0.097 m³ (2 pcs/ctn)`,
  },
  {
    slug: 'esp25h-pe',
    code: 'A-ESP25H/PE-4B',
    model: 'ESP25H/PE',
    sheets: 28,
    format: 'A4/B5/Carta/A5',
    cajon: '1 unidad',
    brand: '4B Office',
    productImageId: 'dbfb14cf',
    shortDescription: `Perforado Max. (70-80g Págs): 28
Encuadernado Max. (70-80g Págs): Arbitrario
Tipo de encuadernado: Perforado manual / Encuadernado eléctrico
Formato: A4/B5/Carta/A5
Margen papel: 2.5 - 4.5 - 6.5 (mm)
Cantidad de agujeros: 46 A4 (pc)
Distancia de agujero: 6.35 - 6.29 (mm)
Tamaño de agujero: 4- 4x5 Ø (mm)
N.W./G.W/CTN: 15/17 (kg)
CBM/CTN: 0.081 m³ (2 pcs/ctn)`,
  },
];

/**
 * @param {{ model: string; sheets: number; format: string }} entry
 */
export function buildEspiraladoraProductName({ model, sheets, format }) {
  return `Espiraladora 4B Office ${model} de ${sheets} Hojas ${format}`;
}
