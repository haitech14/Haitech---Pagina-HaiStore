/** Catálogo de unidades de imagen compatibles MICAMERB/Intercopy (jun 2026). */
export const INTERCOPY_UNIDADES_CATALOG = [
  // 6b86acda — grid 3×2 Ricoh
  {
    slug: 'af-c1027',
    imageId: '6b86acda',
    grid: { col: 0, row: 0, cols: 3, rows: 2 },
    title: 'AF C1027',
    models: 'MP C1027',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-301',
    imageId: '6b86acda',
    grid: { col: 1, row: 0, cols: 3, rows: 2 },
    title: 'MP 301',
    models: 'AF 1515/1515MF/MP161/71/201/301',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-2554',
    imageId: '6b86acda',
    grid: { col: 2, row: 0, cols: 3, rows: 2 },
    title: 'MP2554',
    models: 'MP 2554/3054/3554',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-c4503',
    imageId: '6b86acda',
    grid: { col: 0, row: 1, cols: 3, rows: 2 },
    title: 'MP C4503',
    models: 'MP C4503',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'im430-du',
    imageId: '6b86acda',
    grid: { col: 1, row: 1, cols: 3, rows: 2 },
    title: 'IM430 DU',
    models: 'IM 430 DU',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-501',
    imageId: '6b86acda',
    grid: { col: 2, row: 1, cols: 3, rows: 2 },
    title: 'MP 501',
    models: 'MP 501 DR',
    compatibleBrand: 'Ricoh',
    monochrome: true,
  },

  // 39305d78 — grid 3×1 Ricoh
  {
    slug: 'mp-c306',
    imageId: '39305d78',
    grid: { col: 0, row: 0, cols: 3, rows: 1 },
    title: 'MP C306',
    models: 'MP C305/306/307/405',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-c2503',
    imageId: '39305d78',
    grid: { col: 1, row: 0, cols: 3, rows: 1 },
    title: 'MP C2503',
    models: 'MP C2503 DU',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp-2550',
    imageId: '39305d78',
    grid: { col: 2, row: 0, cols: 3, rows: 1 },
    title: 'MP2550',
    models: 'MP C2510/2550/2550B/2852/2852P/3550',
    compatibleBrand: 'Ricoh',
  },

  // 1c8675a7 — grid 3×2 (5 celdas)
  {
    slug: 'mp401',
    imageId: '1c8675a7',
    grid: { col: 0, row: 0, cols: 3, rows: 2 },
    title: 'MP401',
    models: 'MP 401',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'mp2501',
    imageId: '1c8675a7',
    grid: { col: 1, row: 0, cols: 3, rows: 2 },
    title: 'MP2501',
    models: 'MP C2501',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'bhc-364',
    imageId: '1c8675a7',
    grid: { col: 2, row: 0, cols: 3, rows: 2 },
    title: 'BZ C364',
    models: 'BZ C364 - DR512',
    compatibleBrand: 'Konica Minolta',
  },
  {
    slug: 'bh-c258',
    imageId: '1c8675a7',
    grid: { col: 0, row: 1, cols: 3, rows: 2 },
    title: 'BZ C258',
    models: 'BZ C258/C308 - C368/C458',
    compatibleBrand: 'Konica Minolta',
  },
  {
    slug: 'ir-c256',
    imageId: '1c8675a7',
    grid: { col: 1, row: 1, cols: 3, rows: 2 },
    title: 'IR C256',
    models: 'IR C256 - CMYK',
    compatibleBrand: 'Canon',
  },
];

export const INTERCOPY_UNIDADES_COLOR_VARIANTS = [
  { suffix: 'Cyan', attribute: 'Cyan', code: 'CYAN' },
  { suffix: 'Magenta', attribute: 'Magenta', code: 'MAGENTA' },
  { suffix: 'Amarillo', attribute: 'Yellow', code: 'YELLOW' },
  { suffix: 'Negro', attribute: 'Negro', code: 'NEGRO' },
];
