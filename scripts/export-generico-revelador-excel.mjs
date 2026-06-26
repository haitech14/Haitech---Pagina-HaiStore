import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import XLSX from 'xlsx';

import { GENERICO_REVELADOR_CATALOG } from '../data/seeds/generico-revelador-catalog.mjs';
import {
  buildReveladorProductName,
  expandReveladorCatalog,
} from '../server/lib/generico-revelador.js';
import { deriveCompatibleTonerNumericCode } from '../shared/compatible-toner-product-code.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultOutput = path.join(root, 'data', 'seeds', 'Generico-Revelador.xlsx');

const HEADERS = [
  'Código',
  'ID producto',
  'Título captura',
  'Subtítulo',
  'Color',
  'Marca compatible',
  'Nombre catálogo',
  'Categoría',
  'Subcategoría',
  'Marca producto',
  'Proveedor',
  'Imagen',
];

/**
 * @param {Array<{ id?: string; code?: string; name?: string; image_url?: string | null }>} [products]
 * @param {string} [outputPath]
 */
export function writeReveladorExcel(products = [], outputPath = defaultOutput) {
  const byId = new Map(products.map((product) => [String(product.id), product]));

  const rows = expandReveladorCatalog(GENERICO_REVELADOR_CATALOG).map((entry) => {
    const id = `generico-rv-${entry.productSlug ?? entry.slug}`;
    const saved = byId.get(id);
    const code = saved?.code ?? deriveCompatibleTonerNumericCode(id);
    const name =
      saved?.name ??
      buildReveladorProductName({
        title: entry.title,
        models: entry.models,
        compatibleBrand: entry.compatibleBrand,
        color: entry.color,
      });

    return {
      Código: code,
      'ID producto': id,
      'Título captura': entry.title,
      Subtítulo: entry.models,
      Color: entry.color ?? '',
      'Marca compatible': entry.compatibleBrand,
      'Nombre catálogo': name,
      Categoría: 'Repuestos Compatibles',
      Subcategoría: 'Revelador',
      'Marca producto': 'Generico',
      Proveedor: 'MICAMERB',
      Imagen: saved?.image_url ?? `/products/${id}.webp`,
    };
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  sheet['!cols'] = [
    { wch: 10 },
    { wch: 32 },
    { wch: 24 },
    { wch: 28 },
    { wch: 12 },
    { wch: 18 },
    { wch: 56 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
    { wch: 36 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Revelador');
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
}

function main() {
  const output = process.argv[2] ?? defaultOutput;
  const written = writeReveladorExcel([], output);
  console.log(`Excel generado: ${written}`);
  console.log(`${expandReveladorCatalog(GENERICO_REVELADOR_CATALOG).length} filas.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
