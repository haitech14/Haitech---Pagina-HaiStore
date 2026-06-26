/** Chips de toner/cilindro compatibles Intercopy/MICAMERB (jun 2026). */
export const INTERCOPY_CHIP_TONER_CATALOG = [
  // 61d775e1 — grid 1×2
  {
    slug: 'irc-250-350-cmyk',
    imageId: '61d775e1',
    grid: { col: 0, row: 0, cols: 1, rows: 2 },
    kind: 'cilindro',
    models: 'IR C250/350',
    compatibleBrand: 'Canon',
    fourColors: true,
  },
  {
    slug: 'mp-c4503-5503-6003',
    imageId: '61d775e1',
    grid: { col: 0, row: 1, cols: 1, rows: 2 },
    kind: 'toner',
    models: 'MP C4503/5503/6003',
    compatibleBrand: 'Ricoh',
    fourColors: true,
  },

  // c9a6bceb — grid 2×1
  {
    slug: 'mp-c3002-3502-cmyk',
    imageId: 'c9a6bceb',
    grid: { col: 0, row: 0, cols: 2, rows: 1 },
    kind: 'toner',
    models: 'MP C3002/3502',
    compatibleBrand: 'Ricoh',
    fourColors: true,
  },
  {
    slug: 'mp-c300-400-401-cmyk',
    imageId: 'c9a6bceb',
    grid: { col: 1, row: 0, cols: 2, rows: 1 },
    kind: 'toner',
    models: 'MP C300/400/401',
    compatibleBrand: 'Ricoh',
    fourColors: true,
  },

  // 1fd58151 — grid 3×2
  {
    slug: 'mp-501-601',
    imageId: '1fd58151',
    grid: { col: 0, row: 0, cols: 3, rows: 2 },
    kind: 'toner',
    models: 'MP 501/MP 601',
    compatibleBrand: 'Ricoh',
  },
  {
    slug: 'ir-c2380-2550-2880i',
    imageId: '1fd58151',
    grid: { col: 1, row: 0, cols: 3, rows: 2 },
    kind: 'toner',
    models: 'IR C2380/2550/2880i',
    compatibleBrand: 'Canon',
    fourColors: true,
  },
  {
    slug: 'ir-1435',
    imageId: '1fd58151',
    grid: { col: 2, row: 0, cols: 3, rows: 2 },
    kind: 'toner',
    models: 'IR 1435',
    compatibleBrand: 'Canon',
  },
  {
    slug: 'ir-c5550-cmyk',
    imageId: '1fd58151',
    grid: { col: 0, row: 1, cols: 3, rows: 2 },
    kind: 'toner',
    models: 'IR C5550',
    compatibleBrand: 'Canon',
    fourColors: true,
  },
  {
    slug: 'bh-c258-c308-c368',
    imageId: '1fd58151',
    grid: { col: 1, row: 1, cols: 3, rows: 2 },
    kind: 'toner',
    models: 'BH C258, C308, C368',
    compatibleBrand: 'Konica Minolta',
    fourColors: true,
  },
];

export const INTERCOPY_CHIP_COLOR_VARIANTS = [
  { suffix: 'Cyan', attribute: 'Cyan', code: 'cyan' },
  { suffix: 'Magenta', attribute: 'Magenta', code: 'magenta' },
  { suffix: 'Amarillo', attribute: 'Yellow', code: 'amarillo' },
  { suffix: 'Negro', attribute: 'Negro', code: 'negro' },
];
