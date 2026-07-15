export function isOwnedProductMediaPath(
  product: {
    id?: string;
    code?: string | null;
  },
  url: string,
): boolean;

export function isSyntheticProductMediaUrl(
  product: {
    id?: string;
    image_url?: string | null;
    gallery?: string[] | null;
  },
  url: string,
): boolean;

export function sanitizeStoredProductMedia(product: {
  id?: string;
  code?: string | null;
  name?: string | null;
  category?: string | null;
  brand?: string | null;
  image_url?: string | null;
  gallery?: string[] | null;
}): {
  image_url: string | null;
  gallery: string[];
};
