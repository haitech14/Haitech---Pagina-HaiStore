import type { ProductGalleryItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

export function isYoutubeMediaUrl(url: string): boolean {
  return url.startsWith('youtube:');
}

export function isVideoMediaUrl(url: string): boolean {
  if (url.length === 0) return false;
  if (url.startsWith('data:video/')) return true;
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function isImageMediaUrl(url: string): boolean {
  if (url.length === 0) return false;
  if (isYoutubeMediaUrl(url) || isVideoMediaUrl(url)) return false;
  if (url.startsWith('data:') && !url.startsWith('data:image/')) return false;
  return true;
}

export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('youtube:')) {
    const id = trimmed.slice(8).trim();
    return id.length >= 6 ? id : null;
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return id && id.length >= 6 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && fromQuery.length >= 6) return fromQuery;

      const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return embedMatch[1];

      const shortsMatch = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
  }

  return null;
}

export function normalizeYoutubeMediaUrl(input: string): string | null {
  const id = parseYoutubeVideoId(input);
  return id ? `youtube:${id}` : null;
}

export function youtubeThumbnailUrl(videoId: string, quality = 'hqdefault'): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/** URLs de medios del inventario (principal + galería), sin duplicados. */
export function collectProductMediaUrls(
  product: Pick<Product, 'image_url' | 'gallery'>,
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | null | undefined) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  add(product.image_url);
  for (const url of product.gallery ?? []) {
    add(url);
  }

  return urls;
}

/** @deprecated Usa collectProductMediaUrls */
export function collectProductImageUrls(
  product: Pick<Product, 'image_url' | 'gallery'>,
): string[] {
  return collectProductMediaUrls(product).filter(isImageMediaUrl);
}

export function galleryUrlToItem(url: string, productName: string): ProductGalleryItem {
  if (isYoutubeMediaUrl(url)) {
    const youtubeId = url.slice(8);
    return {
      type: 'video',
      youtubeId,
      title: productName,
      poster: youtubeThumbnailUrl(youtubeId),
    };
  }

  const youtubeId = parseYoutubeVideoId(url);
  if (youtubeId) {
    return {
      type: 'video',
      youtubeId,
      title: productName,
      poster: youtubeThumbnailUrl(youtubeId),
    };
  }

  if (isVideoMediaUrl(url)) {
    return {
      type: 'video-file',
      src: url,
      title: productName,
    };
  }

  return {
    type: 'image',
    src: url,
    alt: productName,
  };
}

export function buildProductGalleryItems(
  product: Pick<Product, 'image_url' | 'gallery' | 'name'>,
): ProductGalleryItem[] {
  return collectProductMediaUrls(product).map((url) => galleryUrlToItem(url, product.name));
}

export function mediaPreviewUrl(url: string): string {
  if (isYoutubeMediaUrl(url)) {
    return youtubeThumbnailUrl(url.slice(8));
  }
  const youtubeId = parseYoutubeVideoId(url);
  if (youtubeId) return youtubeThumbnailUrl(youtubeId);
  return url;
}

export function isVideoGalleryUrl(url: string): boolean {
  return isYoutubeMediaUrl(url) || isVideoMediaUrl(url) || Boolean(parseYoutubeVideoId(url));
}
