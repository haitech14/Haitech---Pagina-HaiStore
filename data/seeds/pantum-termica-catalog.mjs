/** Impresoras térmicas Pantum 72 mm nuevas — Grupo Ventura (jun 2026). */
import { PANTUM_TERMICA_INTRO } from '../../server/lib/pantum-termica.js';

export const PANTUM_TERMICA_CATALOG = [
  {
    slug: 'pd-80',
    model: 'PD-80',
    imageId: 'ae617a0e',
    intro: PANTUM_TERMICA_INTRO,
    connectivity: 'USB',
    specs: {
      resolution: '203 ppp',
      printSpeed: '250 mm/s',
      printWidth: '72 mm',
      memory: '224 KB',
      storage: '8 MB',
    },
  },
];
