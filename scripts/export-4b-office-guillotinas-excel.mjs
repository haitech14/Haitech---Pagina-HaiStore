import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import XLSX from 'xlsx';

import {
  OFFICE_4B_GUILLOTINAS_CATALOG,
  buildGuillotinaProductName,
  extractGuillotinaModel,
} from '../data/seeds/4b-office-guillotinas-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultOutput = path.join(root, 'data', 'seeds', '4B-Office-Guillotinas.xlsx');

const HEADERS = [
  'Código',
  'Modelo',
  'ID producto',
  'Nombre catálogo',
  'Cajón',
  'Categoría',
  'Subcategoría',
  'Marca',
  'Descripción corta',
  'Imagen principal',
];

/**
 * @param {Array<{ id?: string; code?: string; name?: string; description?: string; image_url?: string | null }>} [products]
 * @param {string} [outputPath]
 */
export function writeGuillotinasExcel(products = [], outputPath = defaultOutput) {
  const byId = new Map(products.map((product) => [String(product.id), product]));

  const rows = OFFICE_4B_GUILLOTINAS_CATALOG.map((entry) => {
    const id = `4b-gu-${entry.slug}`;
    const saved = byId.get(id);
    const name =
      saved?.name ??
      buildGuillotinaProductName({
        model: entry.model,
        format: entry.format,
      });

    return {
      Código: saved?.code ?? entry.code,
      Modelo: extractGuillotinaModel(entry.code),
      'ID producto': id,
      'Nombre catálogo': name,
      Cajón: entry.cajon,
      Categoría: 'Equipos de Oficina',
      Subcategoría: 'Guillotina',
      Marca: entry.brand,
      'Descripción corta': saved?.description ?? entry.shortDescription,
      'Imagen principal': saved?.image_url ?? `/products/${id}.webp`,
    };
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  sheet['!cols'] = [
    { wch: 18 },
    { wch: 16 },
    { wch: 22 },
    { wch: 40 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 52 },
    { wch: 32 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Guillotinas');
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
}

function main() {
  const output = process.argv[2] ?? defaultOutput;
  const written = writeGuillotinasExcel([], output);
  console.log(`Excel generado: ${written}`);
  console.log(`${OFFICE_4B_GUILLOTINAS_CATALOG.length} filas.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
