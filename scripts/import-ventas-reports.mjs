import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getSupabaseAdmin } from '../server/lib/supabase-auth.js';
import { importVentasDocumentRows, parseVentasWorkbook } from '../server/lib/ventas-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedsDir = join(__dirname, '..', 'data', 'seeds', 'ventas');

async function main() {
  if (!getSupabaseAdmin()) {
    console.error(
      'Supabase no configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env',
    );
    process.exit(1);
  }

  const files = readdirSync(seedsDir)
    .filter((name) => name.toLowerCase().endsWith('.xlsx'))
    .sort();

  if (files.length === 0) {
    console.error(`No hay archivos .xlsx en ${seedsDir}`);
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let total = 0;
  /** @type {Array<{ file: string; row: number; message: string }>} */
  const errors = [];

  for (const filename of files) {
    const filePath = join(seedsDir, filename);
    console.log(`Importando ${filename}…`);
    const buffer = readFileSync(filePath);
    const { meta, rows } = parseVentasWorkbook(buffer);
    console.log(
      `  Periodo: ${meta.periodStart ?? '?'} – ${meta.periodEnd ?? '?'} (${rows.length} filas)`,
    );
    total += rows.length;
    const result = await importVentasDocumentRows(rows, { sourceFilename: filename });
    created += result.created;
    updated += result.updated;
    skipped += result.skipped;
    for (const err of result.errors) {
      errors.push({ file: filename, row: err.row, message: err.message });
    }
  }

  console.log(
    `\nResumen: ${files.length} archivos, ${total} filas, ${created} creados, ${updated} actualizados, ${skipped} omitidos, ${errors.length} errores.`,
  );

  if (errors.length > 0) {
    console.log('Primeros errores:');
    for (const err of errors.slice(0, 15)) {
      console.log(`  ${err.file} fila ${err.row}: ${err.message}`);
    }
  }

  if (errors.length > 0 && created + updated === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
