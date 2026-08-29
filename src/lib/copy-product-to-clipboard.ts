import { copyTextToClipboard } from '@/lib/copy-text-to-clipboard';

function absoluteUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

function isSameOrigin(url: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

async function canvasToPngBlob(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

async function blobToPngBlob(sourceBlob: Blob): Promise<Blob | null> {
  if (sourceBlob.type === 'image/png') {
    return sourceBlob.type ? sourceBlob : new Blob([sourceBlob], { type: 'image/png' });
  }

  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(sourceBlob);
    try {
      return await canvasToPngBlob(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  }

  const objectUrl = URL.createObjectURL(sourceBlob);
  try {
    return await loadImageElementAsPng(objectUrl, false);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageElementAsPng(url: string, useCors: boolean): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const image = new Image();
    if (useCors) image.crossOrigin = 'anonymous';
    const timeoutId = window.setTimeout(() => resolve(null), 12_000);

    image.onload = () => {
      window.clearTimeout(timeoutId);
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      if (!width || !height) {
        resolve(null);
        return;
      }
      void canvasToPngBlob(image, width, height).then(resolve);
    };

    image.onerror = () => {
      window.clearTimeout(timeoutId);
      resolve(null);
    };

    image.src = url;
  });
}

async function fetchImageBlob(imageUrl: string): Promise<Blob | null> {
  const url = absoluteUrl(imageUrl);
  const sameOrigin = isSameOrigin(url);

  try {
    const response = await fetch(url, {
      mode: sameOrigin ? 'same-origin' : 'cors',
      credentials: sameOrigin ? 'same-origin' : 'omit',
      cache: 'no-cache',
    });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob || blob.size === 0) return null;
    return blob;
  } catch {
    return null;
  }
}

/** Convierte la imagen del producto a PNG para ClipboardItem (webp/jpeg → png). */
export async function fetchProductImageAsPngBlob(imageUrl: string): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;
  const url = absoluteUrl(imageUrl);
  if (!url.trim()) return null;

  const fetched = await fetchImageBlob(url);
  if (fetched) {
    const png = await blobToPngBlob(fetched);
    if (png) return png.type === 'image/png' ? png : new Blob([png], { type: 'image/png' });
  }

  // Fallback: <img> + canvas (útil si fetch CORS falla pero la imagen ya está cacheada con ACAO).
  const viaCorsImage = await loadImageElementAsPng(url, true);
  if (viaCorsImage) return viaCorsImage;

  if (isSameOrigin(url)) {
    const viaLocalImage = await loadImageElementAsPng(url, false);
    if (viaLocalImage) return viaLocalImage;
  }

  return null;
}

function supportsClipboardWrite(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function'
  );
}

async function writeClipboardItem(parts: Record<string, Blob | Promise<Blob>>): Promise<boolean> {
  if (!supportsClipboardWrite()) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem(parts)]);
    return true;
  } catch {
    return false;
  }
}

/** Copia solo texto (+ HTML rico si está disponible). */
export async function copyProductTextToClipboard(input: {
  plain: string;
  html?: string;
}): Promise<boolean> {
  const plainBlob = new Blob([input.plain], { type: 'text/plain' });
  const htmlBlob = input.html
    ? new Blob([input.html], { type: 'text/html' })
    : null;

  if (supportsClipboardWrite()) {
    const parts: Record<string, Blob> = { 'text/plain': plainBlob };
    if (htmlBlob) parts['text/html'] = htmlBlob;
    if (await writeClipboardItem(parts)) return true;
  }

  return copyTextToClipboard(input.plain);
}

/**
 * Copia la imagen principal como PNG.
 * Usa Promise dentro de ClipboardItem para no perder el gesto del usuario tras el fetch.
 */
export async function copyProductImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!supportsClipboardWrite()) return false;

  const pngPromise = fetchProductImageAsPngBlob(imageUrl).then((blob) => {
    if (!blob) throw new Error('No se pudo obtener la imagen');
    return blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
  });

  // Inicia write de inmediato (gesto de clic); el blob se resuelve después.
  if (await writeClipboardItem({ 'image/png': pngPromise })) return true;

  // Fallback: blob ya resuelto (algunos navegadores no aceptan Promise en ClipboardItem).
  try {
    const imageBlob = await pngPromise;
    return writeClipboardItem({ 'image/png': imageBlob });
  } catch {
    return false;
  }
}
