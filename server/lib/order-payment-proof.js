import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

export function getPublicOrderProofsDir() {
  if (process.env.HAISTORE_PUBLIC_ORDER_PROOFS_DIR) {
    return process.env.HAISTORE_PUBLIC_ORDER_PROOFS_DIR;
  }
  return path.join(__dirname, '../../public/order-proofs');
}

export function publicOrderProofPath(orderId, ext) {
  const safeId = String(orderId ?? 'order')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-');
  const stamp = Date.now();
  return `/order-proofs/${safeId}-${stamp}.${ext}`;
}

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], 'base64'),
  };
}

export async function saveOrderPaymentProof(orderId, dataUrl, fileName) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error('Formato de archivo no válido');
  }
  if (!ALLOWED_MIME.has(parsed.mimeType)) {
    throw new Error('Solo se permiten imágenes JPG, PNG, WEBP o PDF');
  }
  if (parsed.buffer.length > MAX_BYTES) {
    throw new Error('El comprobante no puede superar 5 MB');
  }

  const ext = EXT_BY_MIME[parsed.mimeType] ?? 'bin';
  const publicPath = publicOrderProofPath(orderId, ext);
  const absolutePath = path.join(getPublicOrderProofsDir(), path.basename(publicPath));

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, parsed.buffer);

  return {
    url: publicPath,
    fileName: typeof fileName === 'string' && fileName.trim() ? fileName.trim() : `comprobante.${ext}`,
    mimeType: parsed.mimeType,
    bytes: parsed.buffer.length,
    uploadedAt: new Date().toISOString(),
  };
}
