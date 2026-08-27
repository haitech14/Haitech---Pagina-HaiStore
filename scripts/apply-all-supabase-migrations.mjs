/**
 * Aplica todas las migraciones SQL en orden sobre el proyecto Supabase configurado.
 *
 * Uso:
 *   node scripts/apply-all-supabase-migrations.mjs
 *   SUPABASE_URL=https://NUEVO.supabase.co node scripts/apply-all-supabase-migrations.mjs
 */
import { spawnSync } from 'child_process';
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: resolve(root, '.env') });
dotenv.config({ path: resolve(root, '.env.local'), override: true });

const migrationsDir = resolve(root, 'supabase/migrations');
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

if (files.length === 0) {
  console.error('No hay migraciones en supabase/migrations');
  process.exit(1);
}

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || '';
console.log(`Proyecto URL: ${supabaseUrl || '(no definida)'}`);
console.log(`Migraciones (${files.length}):\n${files.map((f) => `  - ${f}`).join('\n')}\n`);

let failed = 0;
const results = [];

for (const file of files) {
  const rel = `supabase/migrations/${file}`;
  console.log(`\n─── ${file} ───`);
  const result = spawnSync(
    process.execPath,
    [resolve(root, 'scripts/apply-supabase-migration.mjs'), rel],
    {
      cwd: root,
      encoding: 'utf8',
      env: process.env,
      shell: false,
    },
  );

  const out = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (out) console.log(out);

  if (result.status === 0) {
    results.push({ file, ok: true });
  } else {
    failed += 1;
    results.push({ file, ok: false });
    console.error(`✗ Falló ${file} (exit ${result.status})`);
    // Continuar: muchas migraciones usan IF NOT EXISTS; fallos parciales se revisan al final.
  }
}

console.log('\n========== Resumen ==========');
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.file}`);
}

if (failed > 0) {
  console.error(`\n${failed} migración(es) fallaron.`);
  process.exit(1);
}

console.log('\nTodas las migraciones se aplicaron correctamente.');
