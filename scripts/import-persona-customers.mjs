import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getSupabaseAdmin } from '../server/lib/supabase-auth.js';
import { importPersonaCustomerRows, parsePersonaWorkbook } from '../server/lib/persona-excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(
  __dirname,
  '..',
  'data',
  'seeds',
  'Reporte_Persona_2026060411714531.xlsx',
);

const filePath = process.argv[2] ?? defaultPath;

async function main() {
  if (!getSupabaseAdmin()) {
    console.error(
      'Supabase no configurado. Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env',
    );
    process.exit(1);
  }

  console.log(`Leyendo ${filePath}…`);
  const buffer = readFileSync(filePath);
  const rows = parsePersonaWorkbook(buffer);
  console.log(`Filas válidas: ${rows.length}`);

  if (rows.length === 0) {
    console.error('No se encontraron filas para importar.');
    process.exit(1);
  }

  const result = await importPersonaCustomerRows(rows);
  console.log(
    `Importación: ${result.created} creados, ${result.updated} actualizados, ${result.skipped} omitidos, ${result.errors.length} errores.`,
  );

  if (result.errors.length > 0) {
    console.log('Primeros errores:');
    for (const err of result.errors.slice(0, 10)) {
      console.log(`  Fila ${err.row}: ${err.message}`);
    }
  }

  if (result.errors.length > 0 && result.created + result.updated === 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
