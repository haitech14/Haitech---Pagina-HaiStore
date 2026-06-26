/** Multifuncionales Canon A3 B/N nuevas — imageRUNNER ADVANCE (jun 2026). */
import { CANON_MF_INTRO } from '../../server/lib/canon-multifuncionales.js';

const SHARED_SPECS = {
  memory: '5 GB',
  storage: '256 GB SSD',
  touchPanel: '10.1"',
  scan: '135 ppm',
  adf: '200 hojas',
  paper: '2 x 550 (principal), 100 (multiuso), Opc: hasta 6350 máx',
  toner: 'Tóner de alta eficiencia (71,5k) con tecnología CS2 (menor consumo de energía)',
};

export const CANON_MULTIFUNCIONALES_CATALOG = [
  {
    slug: '6860i',
    model: '6860i',
    imageId: '9ed9fa0e',
    intro: CANON_MF_INTRO,
    specs: {
      ...SHARED_SPECS,
      speed: '60 ppm',
      monthlyVolume: '70k – 300k',
    },
  },
  {
    slug: '6870i',
    model: '6870i',
    imageId: '9ed9fa0e',
    intro: CANON_MF_INTRO,
    specs: {
      ...SHARED_SPECS,
      speed: '70 ppm',
      monthlyVolume: '70k – 350k',
    },
  },
];
