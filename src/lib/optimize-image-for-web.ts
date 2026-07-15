import {
  PRODUCT_IMAGE_MAX_EDGE,
  PRODUCT_IMAGE_WEBP_QUALITY,
} from '@/lib/product-media-upload-limits';

/** Presets para imágenes en la app (catálogo, inventario, logos). */
export const WEB_IMAGE_PRESETS = {
  product: {
    maxWidth: PRODUCT_IMAGE_MAX_EDGE,
    maxHeight: PRODUCT_IMAGE_MAX_EDGE,
    quality: PRODUCT_IMAGE_WEBP_QUALITY / 100,
    mimeType: 'image/webp' as const,
  },
  logo: {
    maxWidth: 480,
    maxHeight: 480,
    quality: 0.88,
    mimeType: 'image/webp' as const,
  },
} as const;

export type WebImagePreset = keyof typeof WEB_IMAGE_PRESETS;

export type OptimizeImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  mimeType: 'image/webp' | 'image/jpeg';
};

const SKIP_TYPES = new Set(['image/svg+xml', 'image/gif']);

function loadImageElement(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo decodificar la imagen'));
    img.src = source;
  });
}

function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  const ratio = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: OptimizeImageOptions['mimeType'],
  quality: number,
): string {
  const dataUrl = canvas.toDataURL(mimeType, quality);
  if (mimeType === 'image/webp' && dataUrl.startsWith('data:image/png')) {
    return canvas.toDataURL('image/jpeg', quality);
  }
  return dataUrl;
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No se pudo leer la imagen'));
    };
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(blob);
  });
}

export async function optimizeImageBlob(
  blob: Blob,
  options: OptimizeImageOptions,
): Promise<string> {
  if (SKIP_TYPES.has(blob.type)) {
    return readBlobAsDataUrl(blob);
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await loadImageElement(objectUrl);
    const { width, height } = fitDimensions(
      img.naturalWidth,
      img.naturalHeight,
      options.maxWidth,
      options.maxHeight,
    );

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.drawImage(img, 0, 0, width, height);

    return canvasToDataUrl(canvas, options.mimeType, options.quality);
  } catch {
    // HEIC/CMYK/corruptas: el canvas falla; el servidor aún puede optimizar vía sharp.
    return readBlobAsDataUrl(blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function optimizeImageFile(
  file: File,
  preset: WebImagePreset = 'product',
): Promise<string> {
  return optimizeImageBlob(file, WEB_IMAGE_PRESETS[preset]);
}

export async function optimizeImageDataUrl(
  dataUrl: string,
  preset: WebImagePreset = 'product',
): Promise<string> {
  if (!dataUrl.startsWith('data:image/') || dataUrl.startsWith('data:image/svg')) {
    return dataUrl;
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return optimizeImageBlob(blob, WEB_IMAGE_PRESETS[preset]);
}
