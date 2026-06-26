import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import XLSX from 'xlsx';

import { GENERICO_RODILLO_ESPONJA_CATALOG } from '../data/seeds/generico-rodillo-esponja-catalog.mjs';
import { buildRodilloEsponjaProductName } from '../server/lib/generico-rodillo-esponja.js';
import { deriveCompatibleTonerNumericCode } from '../shared/compatible-toner-product-code.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultOutput = path.join(root, 'data', 'seeds', 'Generico-Rodillo-Esponja.xlsx');

const HEADERS = [
  'Código',
  'ID producto',
  'Título captura',
  'Subtítulo',
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
export function writeRodilloEsponjaExcel(products = [], outputPath = defaultOutput) {
  const byId = new Map(products.map((product) => [String(product.id), product]));

  const rows = GENERICO_RODILLO_ESPONJA_CATALOG.map((entry) => {
    const id = `generico-re-${entry.slug}`;
    const saved = byId.get(id);
    const code = saved?.code ?? deriveCompatibleTonerNumericCode(id);
    const name =
      saved?.name ??
      buildRodilloEsponjaProductName({
        title: entry.title,
        models: entry.models,
        compatibleBrand: entry.compatibleBrand,
      });

    return {
      Código: code,
      'ID producto': id,
      'Título captura': entry.title,
      Subtítulo: entry.models,
      'Marca compatible': entry.compatibleBrand,
      'Nombre catálogo': name,
      Categoría: 'Repuestos Compatibles',
      Subcategoría: 'Rodillo de Esponja',
      'Marca producto': 'Generico',
      Proveedor: 'MICAMERB',
      Imagen: saved?.image_url ?? `/products/${id}.webp`,
    };
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  sheet['!cols'] = [
    { wch: 10 },
    { wch: 28 },
    { wch: 34 },
    { wch: 40 },
    { wch: 18 },
    { wch: 64 },
    { wch: 22 },
    { wch: 22 },
    { wch: 14 },
    { wch: 12 },
    { wch: 36 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Rodillo Esponja');
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
}

function main() {
  const output = process.argv[2] ?? defaultOutput;
  const written = writeRodilloEsponjaExcel([], output);
  console.log(`Excel generado: ${written}`);
  console.log(`${GENERICO_RODILLO_ESPONJA_CATALOG.length} filas.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
