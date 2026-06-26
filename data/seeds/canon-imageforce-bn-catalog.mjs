/** Multifuncionales Canon ImageForce B/N nuevas (jun 2026). */

const SHARED_SPECS = {
  scanSpeed: '190 ipm',
  memory: '4.5 GB',
  storage: '256 GB SSD',
  adf: '100 hojas',
  paper: 'Bandeja 550 hojas, Multiuso 100 hojas, Opcional máx. 3,200',
};

/** Imagen principal Canon imageRUNNER ADVANCE DX — compartida por todos los modelos. */
const IMAGEFORCE_BN_IMAGE_ID = '2ac522f0';

export const CANON_IMAGEFORCE_BN_CATALOG = [
  {
    slug: '520',
    model: '520',
    imageId: IMAGEFORCE_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '55 ppm',
      rendimiento: '70k – 200k',
    },
  },
  {
    slug: '610',
    model: '610',
    imageId: IMAGEFORCE_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '65 ppm',
      rendimiento: '70k – 300k',
    },
  },
  {
    slug: '710',
    model: '710',
    imageId: IMAGEFORCE_BN_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '75 ppm',
      rendimiento: '70k – 350k',
    },
  },
];
