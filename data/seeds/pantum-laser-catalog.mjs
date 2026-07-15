/** Impresoras láser Pantum A4 nuevas — Grupo Ventura (jun 2026). */
import { PANTUM_LASER_INTRO } from '../../server/lib/pantum-laser.js';

export const PANTUM_LASER_CATALOG = [
  {
    slug: 'p2509w',
    model: 'P2509W',
    colorMode: 'bn',
    imageId: '4db9b77a',
    intro: PANTUM_LASER_INTRO,
    connectivity: 'Wi-Fi, USB, LAN',
    specs: {
      speed: '22 ppm',
      monthlyVolume: '700 - 15k',
      memory: '128 MB',
      paper: 'Principal: 150 hojas, De 60 a 163 g/m2',
      features: ['Impresión móvil'],
    },
  },
  {
    slug: 'p3300dw',
    model: 'P3300DW',
    colorMode: 'bn',
    imageId: 'b86004b4',
    intro: PANTUM_LASER_INTRO,
    connectivity: 'Wi-Fi, USB, LAN',
    specs: {
      speed: '33 ppm',
      monthlyVolume: '3k - 60k',
      storage: '256 GB SSD',
      paperOutput: '150 hojas',
      paperWeight: '60 - 105 g/m²',
      paper: 'Bandejas estándar: 250 pág',
    },
  },
];
