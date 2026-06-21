/**
 * Elimina productos huérfanos en Supabase (no presentes en inventory.json local).
 * Uso: npm run sync:prune
 */
import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

import { getInventoryPath } from '../server/lib/server-paths.js';

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !key) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

function loadLocalIds() {
  const path = getInventoryPath();
  if (!existsSync(path)) {
    console.error(`No se encontró inventario en ${path}`);
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const deleted = new Set(Array.isArray(data.deletedProductIds) ? data.deletedProductIds : []);
  return new Set(
    (data.products ?? [])
      .filter((product) => product?.id && !deleted.has(product.id))
      .map((product) => product.id),
  );
}

async function fetchRemoteIds() {
  const ids = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.from('products').select('id').range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = data ?? [];
    ids.push(...page.map((row) => row.id));
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return ids;
}

async function main() {
  console.log('HaiStore — depuración Supabase (productos huérfanos)\n');

  const localIds = loadLocalIds();
  console.log(`Inventario local: ${localIds.size} ids activos`);

  const remoteIds = await fetchRemoteIds();
  console.log(`Supabase remoto: ${remoteIds.length} filas`);

  const orphanIds = remoteIds.filter((id) => !localIds.has(id));
  if (orphanIds.length === 0) {
    console.log('✓ No hay productos huérfanos.');
    return;
  }

  console.log(`Eliminando ${orphanIds.length} productos huérfanos…`);
  const batch = 100;
  for (let i = 0; i < orphanIds.length; i += batch) {
    const chunk = orphanIds.slice(i, i + batch);
    const { error } = await supabase.from('products').delete().in('id', chunk);
    if (error) throw new Error(error.message);
    process.stdout.write(`\r  Eliminados: ${Math.min(i + batch, orphanIds.length)}/${orphanIds.length}`);
  }
  console.log('\n✓ Depuración completada.');
}

main().catch((error) => {
  console.error('\nError:', error.message);
  process.exit(1);
});
