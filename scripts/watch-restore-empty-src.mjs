/**
 * Vigila src/ y restaura desde git cualquier .ts/.tsx truncado (< 40 bytes).
 * Uso: node scripts/watch-restore-empty-src.mjs
 */
import { execFileSync } from 'node:child_process';
import { watch } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');
const MIN_BYTES = 40;
const EXT = new Set(['.ts', '.tsx']);

/** @type {Set<string>} */
const pending = new Set();
let timer = null;

function walk(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === 'node_modules' || name.name === '.git') continue;
      walk(full, out);
      continue;
    }
    if (!EXT.has(path.extname(name.name))) continue;
    out.push(full);
  }
  return out;
}

function restore(files) {
  if (files.length === 0) return;
  const rel = files.map((f) => path.relative(root, f).replace(/\\/g, '/'));
  try {
    execFileSync('git', ['checkout', 'HEAD', '--', ...rel], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    console.log(`[watch-restore] restaurados ${rel.length}: ${rel.join(', ')}`);
  } catch (err) {
    console.error('[watch-restore] fallo git checkout', err?.message || err);
  }
}

function scanOnce() {
  const bad = [];
  for (const file of walk(srcRoot)) {
    try {
      if (statSync(file).size < MIN_BYTES) bad.push(file);
    } catch {
      /* ignore */
    }
  }
  if (bad.length) restore(bad);
}

function schedule(file) {
  pending.add(file);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    const files = [...pending];
    pending.clear();
    timer = null;
    const bad = files.filter((f) => {
      try {
        return EXT.has(path.extname(f)) && statSync(f).size < MIN_BYTES;
      } catch {
        return false;
      }
    });
    if (bad.length) restore(bad);
  }, 250);
}

scanOnce();
watch(srcRoot, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  schedule(path.join(srcRoot, filename));
});

console.log(`[watch-restore] vigilando ${srcRoot} (restaura < ${MIN_BYTES} bytes)`);
setInterval(scanOnce, 5000);
