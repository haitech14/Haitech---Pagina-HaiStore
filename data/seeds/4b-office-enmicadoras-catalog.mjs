/** Catálogo enmicadoras 4B Office (jun 2026). */

/**
 * @param {string} code
 */
export function extractEnmicadoraModel(code) {
  const match = String(code ?? '').match(/^A-(.+?)(?:-4B|\/4B)$/);
  return match?.[1] ?? String(code ?? '').trim();
}

/**
 * @param {{ code: string; specValue: string; format: string }} input
 */
export function buildEnmicadoraProductName({ code, specValue, format }) {
  const model = extractEnmicadoraModel(code);
  return `Enmicadora 4B Office ${model} de ${specValue} ${format}`;
}

export const OFFICE_4B_ENMICADORAS_CATALOG = [
  {
    slug: 'emameta3led',
    code: 'A-EMAMETA3LED-4B',
    specValue: '330 mm',
    format: 'A3',
    cajon: '2 unidades',
    brand: '4B Office',
    productImageId: 'fcd6f86e',
    productSide: 'left',
    shortDescription: `Ancho de laminado: 330 mm
Espesor de laminado: 2.5 mm
Velocidad: 0.5 m/min
Temperatura: 60 - 180 °C
Tiempo de calentamiento: 3 min
Cantidad de roller: 4
Sistema de calentamiento: Hot tube
Fuente de energía: 110V-220V-60HZ-50HZ
Consumo de energía: 620w`,
  },
];
