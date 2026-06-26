/** Multifuncionales Canon ImageForce a color (no OLED) nuevas (jun 2026). */

const SHARED_SPECS = {
  scanSpeed: '190 ppm',
  memory: '4.5 GB',
  storage: '256 GB SSD',
  adf: '100 hojas',
  paper: 'Bandeja 550 hojas, Multiuso 100 hojas, Opcional máx. 2,300',
};

/** Imagen principal Canon imageFORCE — compartida por todos los modelos. */
const IMAGEFORCE_COLOR_IMAGE_ID = '30af6b78';

export const CANON_IMAGEFORCE_COLOR_CATALOG = [
  {
    slug: 'c331',
    model: 'C331',
    imageId: IMAGEFORCE_COLOR_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '34 ppm',
      rendimiento: '10k – 105k',
    },
  },
  {
    slug: 'c431',
    model: 'C431',
    imageId: IMAGEFORCE_COLOR_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '45 ppm',
      rendimiento: '10k – 135k',
    },
  },
  {
    slug: 'c521',
    model: 'C521',
    imageId: IMAGEFORCE_COLOR_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '55 ppm',
      rendimiento: '10k – 160k',
    },
  },
  {
    slug: 'c611',
    model: 'C611',
    imageId: IMAGEFORCE_COLOR_IMAGE_ID,
    specs: {
      ...SHARED_SPECS,
      speed: '65 ppm',
      rendimiento: '10k – 185k',
    },
  },
];
