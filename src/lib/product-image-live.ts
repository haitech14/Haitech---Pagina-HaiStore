import { extractProductImageCacheVersion } from '@/lib/admin-inventory-product-image';

type LiveMediaSource = {
  image_url?: string | null | undefined;
  gallery?: string[] | null | undefined;
  updated_at?: string | null | undefined;
} | null | undefined;

type SnapshotMediaSource = {
  image_url?: string | null | undefined;
  image?: string | null | undefined;
  gallery?: string[] | null | undefined;
};

function trimUrl(url: string | null | undefined): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** El índice vivo gana al snapshot (home-bundle / sessionStorage). */
export function resolveLiveStorefrontMedia(
  live: LiveMediaSource,
  snapshot: SnapshotMediaSource,
): {
  image_url: string | null;
  gallery: string[];
  imageVersion: string | null;
} {
  const snapshotImage = trimUrl(snapshot.image_url) ?? trimUrl(snapshot.image);
  const snapshotGallery = Array.isArray(snapshot.gallery) ? snapshot.gallery : [];

  if (!live) {
    return {
      image_url: snapshotImage,
      gallery: snapshotGallery,
      imageVersion: extractProductImageCacheVersion(snapshotImage),
    };
  }

  const image_url =
    live.image_url !== undefined ? trimUrl(live.image_url) : snapshotImage;
  const gallery = Array.isArray(live.gallery) ? live.gallery : snapshotGallery;

  return {
    image_url,
    gallery,
    imageVersion: extractProductImageCacheVersion(image_url, live.updated_at),
  };
}
