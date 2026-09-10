import { useCatalogProductRow } from '@/hooks/use-catalog-product-row';
import { resolveLiveStorefrontMedia } from '@/lib/product-image-live';

/** Imagen/galería del índice vivo, con fallback al snapshot de la tarjeta. */
export function useLiveProductCardMedia(
  productId: string,
  snapshot: {
    image_url?: string | null | undefined;
    image?: string | null | undefined;
    gallery?: string[] | null | undefined;
  },
  options?: { loadIfMissing?: boolean },
) {
  const catalogProduct = useCatalogProductRow(productId, options);
  const media = resolveLiveStorefrontMedia(catalogProduct, snapshot);
  return { catalogProduct, ...media };
}
