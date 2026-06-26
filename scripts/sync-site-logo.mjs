/**
 * Sincroniza public/logo.png y public/logo.ico desde el logo maestro en git o public/.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPng = path.join(root, 'public', 'logo.png');
const logoIco = path.join(root, 'public', 'logo.ico');
const gitLogo = 'public/Logo Haitech.png';

function resolveSource() {
  const gitCandidates = [
    '":public/Logo Haitech.png"',
    '"HEAD:public/Logo Haitech.png"',
  ];

  for (const spec of gitCandidates) {
    try {
      const buffer = execSync(`git show ${spec}`, {
        cwd: root,
        encoding: 'buffer',
        maxBuffer: 10 * 1024 * 1024,
      });
      if (buffer.length > 0) return buffer;
    } catch {
      // siguiente candidato
    }
  }

  if (fs.existsSync(logoPng) && fs.statSync(logoPng).size > 0) return logoPng;

  const asset = path.join(
    process.env.USERPROFILE ?? '',
    '.cursor',
    'projects',
    'c-Users-nicol-HaiStore',
    'assets',
    'c__Users_nicol_HaiStore_public_Logo_Haitech.png',
  );
  if (fs.existsSync(asset)) return asset;

  throw new Error('No se encontró el logo HAITECH de origen.');
}

async function writeIcoFromPng(input) {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(input)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer(),
    ),
  );

  try {
    const pngToIco = (await import('png-to-ico')).default;
    const ico = await pngToIco(pngs);
    fs.writeFileSync(logoIco, ico);
    return;
  } catch {
    // Fallback: favicon PNG de 32px con extensión .ico no es ideal; usamos el PNG redimensionado.
    await sharp(input)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(logoIco);
  }
}

async function main() {
  const source = resolveSource();
  if (Buffer.isBuffer(source)) {
    fs.writeFileSync(logoPng, source);
  } else {
    fs.copyFileSync(source, logoPng);
  }

  await writeIcoFromPng(logoPng);
  console.log('Actualizado:', path.relative(root, logoPng), path.relative(root, logoIco));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
