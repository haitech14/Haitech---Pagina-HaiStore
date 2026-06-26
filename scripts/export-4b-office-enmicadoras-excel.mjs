import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import XLSX from 'xlsx';

import {
  OFFICE_4B_ENMICADORAS_CATALOG,
  buildEnmicadoraProductName,
  extractEnmicadoraModel,
} from '../data/seeds/4b-office-enmicadoras-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const defaultOutput = path.join(root, 'data', 'seeds', '4B-Office-Enmicadoras.xlsx');

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
  'Imagen descripción',
];

/**
 * @param {Array<{ id?: string; code?: string; name?: string; description?: string; image_url?: string | null; gallery?: string[] }>} [products]
 * @param {string} [outputPath]
 */
export function writeEnmicadorasExcel(products = [], outputPath = defaultOutput) {
  const byId = new Map(products.map((product) => [String(product.id), product]));

  const rows = OFFICE_4B_ENMICADORAS_CATALOG.map((entry) => {
    const id = `4b-em-${entry.slug}`;
    const saved = byId.get(id);
    const name =
      saved?.name ??
      buildEnmicadoraProductName({
        code: entry.code,
        specValue: entry.specValue,
        format: entry.format,
      });

    return {
      Código: saved?.code ?? entry.code,
      Modelo: extractEnmicadoraModel(entry.code),
      'ID producto': id,
      'Nombre catálogo': name,
      Cajón: entry.cajon,
      Categoría: 'Equipos de Oficina',
      Subcategoría: 'Enmicadora',
      Marca: entry.brand,
      'Descripción corta': saved?.description ?? entry.shortDescription,
      'Imagen principal': saved?.image_url ?? `/products/${id}.webp`,
      'Imagen descripción': saved?.gallery?.[0] ?? `/products/${id}-descripcion.webp`,
    };
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const sheet = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  sheet['!cols'] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 52 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 48 },
    { wch: 32 },
    { wch: 36 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Enmicadoras');
  XLSX.writeFile(workbook, outputPath);

  return outputPath;
}

function main() {
  const output = process.argv[2] ?? defaultOutput;
  const written = writeEnmicadorasExcel([], output);
  console.log(`Excel generado: ${written}`);
  console.log(`${OFFICE_4B_ENMICADORAS_CATALOG.length} filas.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
