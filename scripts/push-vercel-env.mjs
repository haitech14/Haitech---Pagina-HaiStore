/**
 * Sincroniza variables de .env al proyecto Vercel (Production).
 * Uso: node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env');

const KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CORS_ORIGIN',
  'HAISTORE_CATALOG_SOURCE',
  'HAISUPPORT_API_URL',
  'HAISUPPORT_API_KEY',
  'HAISUPPORT_SYNC_ENABLED',
  'HAISUPPORT_WEBHOOK_SECRET',
  'HAISTORE_DATA_SOURCE',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = parseEnvFile(envPath);
if (!env.VITE_SUPABASE_URL && !env.SUPABASE_URL) {
  console.error('No se encontró .env con credenciales Supabase en la raíz del proyecto.');
  process.exit(1);
}

if (!env.CORS_ORIGIN) {
  env.CORS_ORIGIN =
    'https://haitech.pe,https://www.haitech.pe,https://haistore.vercel.app,http://localhost:5173';
}

if (!env.HAISTORE_CATALOG_SOURCE) {
  env.HAISTORE_CATALOG_SOURCE = 'supabase';
}

if (!env.SUPABASE_URL && env.VITE_SUPABASE_URL) {
  env.SUPABASE_URL = env.VITE_SUPABASE_URL;
}

let ok = 0;
let skip = 0;

for (const key of KEYS) {
  const value = env[key];
  if (!value) {
    skip += 1;
    continue;
  }

  const result = spawnSync(
    'vercel',
    ['env', 'add', key, 'production', '--force', '--sensitive'],
    {
      cwd: root,
      input: value,
      encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );

  if (result.status === 0) {
    console.log(`✓ ${key}`);
    ok += 1;
  } else {
    const err = (result.stderr || result.stdout || '').trim();
    console.error(`✗ ${key}:`, err || `exit ${result.status}`);
  }
}

console.log(`\nListo: ${ok} variables, ${skip} omitidas (vacías).`);
console.log('Ejecuta: vercel deploy --prod');
