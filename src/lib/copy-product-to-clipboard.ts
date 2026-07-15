import { copyTextToClipboard } from '@/lib/copy-text-to-clipboard';

function absoluteUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return url;
  }
}

/** Convierte la imagen del producto a PNG para ClipboardItem (webp/jpeg → png). */
export async function fetchProductImageAsPngBlob(imageUrl: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  try {
    const response = await fetch(absoluteUrl(imageUrl), {
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'force-cache',
    });
    if (!response.ok) return null;

    const sourceBlob = await response.blob();
    if (sourceBlob.type === 'image/png') return sourceBlob;

    const bitmap = await createImageBitmap(sourceBlob);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0);

      const png = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
      return png;
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
}

function supportsClipboardWrite(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function'
  );
}

async function writeClipboardItem(parts: Record<string, Blob>): Promise<boolean> {
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

/** Copia solo la imagen principal como PNG. */
export async function copyProductImageToClipboard(imageUrl: string): Promise<boolean> {
  const imageBlob = await fetchProductImageAsPngBlob(imageUrl);
  if (!imageBlob) return false;
  return writeClipboardItem({ 'image/png': imageBlob });
}
