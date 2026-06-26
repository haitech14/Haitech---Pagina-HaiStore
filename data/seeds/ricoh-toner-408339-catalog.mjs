/** @typedef {import('../../server/lib/inventory-store.js').NormalizedProduct} NormalizedProduct */

const COMPAT_SUFFIX =
  'Ricoh M C250FW / Ricoh M C250FWB / Ricoh M C251FW / Ricoh P C301W / Ricoh P C311W';

export const RICOH_TONER_408339 = {
  id: '408339',
  code: '408339',
  name: `Cartucho De Tóner Ricoh M C250 H Amarillo Original — ${COMPAT_SUFFIX}`,
  brand: 'Ricoh',
  category: 'Suministros, Toner Originales',
  publicPen: 610.35,
  stock: 0,
  heroAssetToken: '14630cf6',
  galleryAssetTokens: [
    'ChatGPT_Image_26_jun_2026__01_02_18-06d822db',
    'ChatGPT_Image_26_jun_2026__01_02_18-5177a602',
  ],
  attributes: [
    { name: 'Rendimiento', value: '6.300 páginas al 5%' },
    { name: 'Gramaje del cartucho', value: '130g' },
    { name: 'Color del cartucho', value: 'Amarillo' },
    { name: 'Tecnología', value: 'Láser' },
    { name: 'Modelo de equipo', value: COMPAT_SUFFIX.replace(/ \/ /g, ', ') },
  ],
  descriptionIntro:
    'El Cartucho de tóner amarillo original RICOH M C250H está diseñado para las impresoras Ricoh Aficio MP C250 / MP C250SP / MP C250SF y otros modelos compatibles que utilizan esta referencia, ofreciendo impresiones a color brillantes, uniformes y de calidad profesional en documentos corporativos, gráficos y materiales visuales. Este consumible de alto rendimiento (High Yield) proporciona un rendimiento real de hasta aproximadamente 6 300 páginas bajo el estándar ISO/IEC 19798 (5 % de cobertura por color), asegurando una reproducción cromática consistente desde la primera hasta la última impresión. El uso de tóner original Ricoh garantiza una fijación estable del tóner, colores precisos y protección de los componentes internos del equipo, contribuyendo a una mayor fiabilidad operativa y un costo por página eficiente en entornos de oficina exigentes.',
  descriptionSpecs: [
    'Modelos compatibles: Ricoh M C250FW, Ricoh M C250FWB, Ricoh M C251FW, Ricoh P C301W, Ricoh P C311W',
    'OEM: RICOH Original',
    'Nro. Parte: 408339',
    'Rendimiento: 6.300 páginas al 5%',
    'Gramaje: 130g',
    'Color: Amarillo',
    'Tecnología: Láser',
  ],
};
