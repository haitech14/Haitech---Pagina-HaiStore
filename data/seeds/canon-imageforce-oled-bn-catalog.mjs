/** Multifuncionales Canon ImageForce OLED B/N nuevas (jun 2026). */

const SHARED_SPECS = {
  scanSpeed: '270 ipm',
  memory: '6 GB',
  storage: '256 GB SSD',
  adf: '200 hojas',
  paper: 'Bandeja 550 hojas x2, Multiuso 100 hojas, Opcional máx. 6,350',
};

const SHARED_SPECS_HIGH_VOLUME = {
  scanSpeed: '270 ppm',
  memory: '6.5 GB',
  storage: '512 GB SSD',
  adf: '200 hojas',
  paper:
    'Bandejas A4 1770 hojas x2, Bandejas A3 570, Multiuso 250 hojas, Opcional máx. 9,360',
};

/** Imagen principal Canon imageFORCE C700 — serie 6155/6160/6170. */
const IMAGEFORCE_OLED_BN_IMAGE_ID = '0be64c16';

/** Imagen principal Canon imageFORCE con finisher — serie alto volumen. */
const IMAGEFORCE_OLED_BN_HIGH_VOLUME_IMAGE_ID = 'd870f471';

const INTRO_HIGH_VOLUME_SERIES = [
  'Diseñada para la impresión de gran volumen, ideal para oficinas medianas y grandes.',
  'Mejora la eficiencia con dispositivos multifunción en blanco y negro de alta capacidad que ofrecen una amplia gama de alimentadores y unidades de acabado profesionales, una seguridad sólida y una sostenibilidad mejorada.',
];

export const CANON_IMAGEFORCE_OLED_BN_CATALOG = [
  {
    slug: '6155',
    model: '6155',
    imageId: IMAGEFORCE_OLED_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '55 ppm',
      rendimiento: '70k – 300k',
    },
  },
  {
    slug: '6160',
    model: '6160',
    imageId: IMAGEFORCE_OLED_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '65 ppm',
      rendimiento: '70k – 320k',
    },
  },
  {
    slug: '6170',
    model: '6170',
    imageId: IMAGEFORCE_OLED_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '75 ppm',
      rendimiento: '70k – 382k',
    },
  },
  {
    slug: '8186i',
    model: '8186i',
    imageId: IMAGEFORCE_OLED_BN_HIGH_VOLUME_IMAGE_ID,
    introLines: INTRO_HIGH_VOLUME_SERIES,
    specs: {
      ...SHARED_SPECS_HIGH_VOLUME,
      speed: '86 ppm',
      rendimiento: '300k – 1m',
    },
  },
  {
    slug: '8195i',
    model: '8195i',
    imageId: IMAGEFORCE_OLED_BN_HIGH_VOLUME_IMAGE_ID,
    introLines: INTRO_HIGH_VOLUME_SERIES,
    specs: {
      ...SHARED_SPECS_HIGH_VOLUME,
      speed: '95 ppm',
      rendimiento: '300k – 1.1m',
    },
  },
  {
    slug: '8105i',
    model: '8105i',
    imageId: IMAGEFORCE_OLED_BN_HIGH_VOLUME_IMAGE_ID,
    introLines: INTRO_HIGH_VOLUME_SERIES,
    specs: {
      ...SHARED_SPECS_HIGH_VOLUME,
      speed: '105 ppm',
      rendimiento: '300k – 1.2m',
    },
  },
];
