/** Multifuncionales Canon ImageForce OLED a color nuevas (jun 2026). */

const SHARED_SPECS = {
  scanSpeed: '135 ppm',
  memory: '6 GB',
  storage: '256 GB SSD',
  adf: '200 hojas',
  paper: 'Bandeja 550 hojas x2, Multiuso 100 hojas, Opcional máx. 6,350',
};

/** Imagen principal Canon imageFORCE — compartida por todos los modelos. */
const IMAGEFORCE_IMAGE_ID = '52071cec';

export const CANON_IMAGEFORCE_CATALOG = [
  {
    slug: 'c5140',
    model: 'C5140',
    imageId: IMAGEFORCE_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '40 ppm',
      rendimiento: '45k – 170k',
    },
  },
  {
    slug: 'c5150',
    model: 'C5150',
    imageId: IMAGEFORCE_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '50 ppm',
      rendimiento: '50k – 230k',
    },
  },
  {
    slug: 'c5160',
    model: 'C5160',
    imageId: IMAGEFORCE_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '60 ppm',
      rendimiento: '60k – 300k',
    },
  },
  {
    slug: 'c5170',
    model: 'C5170',
    imageId: IMAGEFORCE_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '70 ppm',
      rendimiento: '80k – 350k',
    },
  },
];
